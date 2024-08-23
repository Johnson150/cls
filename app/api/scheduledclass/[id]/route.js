import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export const GET = async (request, { params }) => {
    try {
        const { id } = params;

        // Fetch the scheduled class with associated tutors and students
        const scheduledClass = await client.scheduledClass.findUnique({
            where: {
                id,
            },
            include: {
                students: {
                    include: {
                        student: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                tutors: {
                    include: {
                        tutor: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                course: {
                    select: {
                        courseName: true,
                    },
                },
            },
        });

        if (!scheduledClass) {
            return NextResponse.json({ message: "Scheduled class not found" }, { status: 404 });
        }

        // Extract tutor names and student names
        const tutorNames = scheduledClass.tutors.map(t => t.tutor.name);
        const studentNames = scheduledClass.students.map(s => s.student.name);

        // Include course name, capacity, current enrollment, tutor names, and student names
        const response = {
            ...scheduledClass,
            courseName: scheduledClass.course?.courseName || null,
            tutorNames,
            studentNames,
            capacity: scheduledClass.capacity,
            currentEnrollment: scheduledClass.currentEnrollment,
            bookedOffBy: scheduledClass.bookedOffBy,
            bookedOffByName: scheduledClass.bookedOffByName,
            classMode: scheduledClass.classMode, // Include classMode
        };

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json(
            { message: "Error getting scheduled class", error: error.message },
            { status: 500 }
        );
    }
};

export const PATCH = async (req, { params }) => {
    try {
        const id = params.id;
        if (!id) {
            throw new Error("Class ID is required.");
        }

        const body = await req.json();

        const {
            classDatestart,
            classDateend,
            status,
            tutorNames = [],
            studentNames = [],
            courseId,
            bookedOffBy,
            bookedOffByName = "NONE",
            classMode,
        } = body;

        const formattedClassDatestart = classDatestart ? new Date(classDatestart).toISOString() : undefined;
        const formattedClassDateend = classDateend ? new Date(classDateend).toISOString() : undefined;

        let courseName;
        if (courseId) {
            const course = await client.course.findUnique({
                where: { id: courseId },
                select: { courseName: true }
            });

            if (!course) {
                throw new Error("Course not found");
            }
            courseName = course.courseName;
        }

        // Fetch tutor and student IDs based on their names
        const tutorIds = await client.tutor.findMany({
            where: { name: { in: tutorNames } },
            select: { id: true }
        }).then(res => res.map(tutor => tutor.id));

        const studentIds = await client.student.findMany({
            where: { name: { in: studentNames } },
            select: { id: true }
        }).then(res => res.map(student => student.id));

        const updateData = {
            ...(formattedClassDatestart && { classDatestart: formattedClassDatestart }),
            ...(formattedClassDateend && { classDateend: formattedClassDateend }),
            ...(status && { status }),
            ...(classMode && { classMode }),
            ...(courseId && {
                course: { connect: { id: courseId } },
                courseName,
            }),
            tutorNames,
            studentNames,
            bookedOffBy,
            bookedOffByName,
            currentEnrollment: studentIds.length,
            capacity: 4, // Assuming capacity is fixed
            tutors: {
                deleteMany: {}, // First, clear existing relations
                create: tutorIds.map(tutorId => ({
                    tutor: { connect: { id: tutorId } },
                }))
            },
            students: {
                deleteMany: {}, // First, clear existing relations
                create: studentIds.map(studentId => ({
                    student: { connect: { id: studentId } },
                }))
            }
        };

        const updatedScheduledClass = await client.scheduledClass.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updatedScheduledClass);
    } catch (error) {
        console.error("Error updating scheduled class:", error.message);
        return NextResponse.json(
            { message: "Error updating scheduled class", error: error.message },
            { status: 500 }
        );
    }
};




export const DELETE = async (request, { params }) => {
    try {
        const { id } = params;

        if (!id) {
            throw new Error("Invalid class ID");
        }

        // Delete related records first if any (like many-to-many relations)
        await client.tutorScheduledClass.deleteMany({
            where: { scheduledClassId: id },
        });

        await client.studentScheduledClass.deleteMany({
            where: { scheduledClassId: id },
        });

        // Now delete the scheduled class
        const deletedClass = await client.scheduledClass.delete({
            where: { id },
        });

        if (!deletedClass) {
            return NextResponse.json({ message: "Class not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Class deleted successfully" });
    } catch (error) {
        console.error("Error deleting class:", error.message);
        return NextResponse.json({ message: "Error deleting class", error: error.message }, { status: 500 });
    }
};
