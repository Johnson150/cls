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

const MAX_CAPACITY = 4; // Maximum capacity for a class

export const PATCH = async (req, { params }) => {
    try {
        const id = params.id;
        if (!id) {
            throw new Error("Class ID is required.");
        }

        const body = await req.json();
        console.log("Request Body:", body);

        const {
            classDatestart,
            classDateend,
            status,
            tutorIds = [],
            studentIds,
            courseId,
            bookedOffBy,
            bookedOffByName = "NONE",
        } = body;

        if (status && !['BOOKED_OFF', 'NOT_BOOKED_OFF'].includes(status)) {
            throw new Error("Invalid status value.");
        }

        const formattedClassDatestart = classDatestart ? new Date(classDatestart).toISOString() : undefined;
        const formattedClassDateend = classDateend ? new Date(classDateend).toISOString() : undefined;

        console.log("Formatted classDatestart:", formattedClassDatestart);
        console.log("Formatted classDateend:", formattedClassDateend);

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

        const tutorNames = tutorIds.length > 0 ? (await client.tutor.findMany({
            where: { id: { in: tutorIds } },
            select: { name: true },
        })).map(tutor => tutor.name) : undefined;

        const studentNames = studentIds?.length > 0 ? (await client.student.findMany({
            where: { id: { in: studentIds } },
            select: { name: true },
        })).map(student => student.name) : undefined;

        let bookedOffByEnum;
        if (bookedOffBy === "TUTOR" || bookedOffBy === "STUDENT") {
            bookedOffByEnum = bookedOffBy;
        } else if (bookedOffBy === "NONE") {
            bookedOffByEnum = "NONE";
        } else {
            throw new Error("Invalid bookedOffBy value.");
        }

        const updateData = {
            ...(formattedClassDatestart && { classDatestart: formattedClassDatestart }),
            ...(formattedClassDateend && { classDateend: formattedClassDateend }),
            ...(status && { status }),
            ...(courseId && {
                course: { connect: { id: courseId } },
                courseName,
            }),
            ...(tutorNames && { tutorNames }),
            ...(studentNames && { studentNames }),
            bookedOffBy: bookedOffByEnum,
            bookedOffByName,
            ...(studentIds && { currentEnrollment: studentIds.length }),
            capacity: MAX_CAPACITY,
        };

        if (tutorIds.length > 0) {
            updateData.tutors = {
                upsert: tutorIds.map(tutorId => ({
                    where: { id: tutorId },
                    update: {},
                    create: {
                        tutor: { connect: { id: tutorId } },
                    },
                })),
            };
        }

        if (studentIds) {
            updateData.students = {
                upsert: studentIds.map(studentId => ({
                    where: { id: studentId },
                    update: {},
                    create: {
                        student: { connect: { id: studentId } },
                    },
                })),
            };
        }

        const updatedScheduledClass = await client.scheduledClass.update({
            where: { id },
            data: updateData,
        });

        console.log("Updated scheduled class:", updatedScheduledClass);

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
