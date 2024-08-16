import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// GET specific student by ID
export const GET = async (request, { params }) => {
    try {
        const { id } = params;

        const student = await client.student.findUnique({
            where: {
                id
            },
            include: {
                tutors: true, // Include associated tutors
                scheduledClasses: {
                    include: {
                        scheduledClass: true, // Include associated scheduled classes
                    },
                },
                courses: {
                    include: {
                        course: true, // Include associated courses
                    },
                },
            },
        });

        if (!student) {
            return NextResponse.json({ message: "Student not found" }, { status: 404 });
        }

        return NextResponse.json(student);
    } catch (error) {
        return NextResponse.json({ message: "Error getting student", error }, { status: 500 });
    }
};

// PATCH update a student by ID
export const PATCH = async (req, { params }) => {
    try {
        const { id } = params;
        const body = await req.json();
        const { name, subject, hoursin, hoursscheduled, timesbookedoff = 0, contact, tutorIds, scheduledClassIds, courseIds } = body;

        // Verify that the student exists
        const studentExists = await client.student.findUnique({
            where: { id },
            include: {
                courses: true, // Include current courses to check against new ones
            }
        });

        if (!studentExists) {
            throw new Error("Student not found.");
        }

        // Prepare update data
        let updateData = {
            name,
            hoursin,
            hoursscheduled,
            timesbookedoff,
            contact, // Include contact in the update data
            tutors: {
                deleteMany: {}, // Remove all existing tutor relations
                create: tutorIds.map((tutorId) => ({
                    tutor: { connect: { id: tutorId } }
                }))
            },
            scheduledClasses: {
                deleteMany: {}, // Remove all existing scheduled class relations
                create: scheduledClassIds.map((scheduledClassId) => ({
                    scheduledClass: { connect: { id: scheduledClassId } }
                }))
            }
        };

        // If courseIds are provided and different from current courses, update them
        if (courseIds && courseIds.length > 0) {
            const validCourseIds = courseIds.filter(courseId => courseId !== null && courseId !== undefined);

            // Verify that all courses exist
            const courseExists = await client.course.findMany({
                where: { id: { in: validCourseIds } }
            });

            if (courseExists.length !== validCourseIds.length) {
                throw new Error("One or more selected courses were not found.");
            }

            // Update course relations only if different
            const currentCourseIds = studentExists.courses.map(sc => sc.courseId);
            const coursesChanged = validCourseIds.length !== currentCourseIds.length || !validCourseIds.every(id => currentCourseIds.includes(id));

            if (coursesChanged) {
                updateData.courses = {
                    deleteMany: {}, // Remove all existing course relations
                    create: validCourseIds.map((courseId) => ({
                        course: { connect: { id: courseId } }
                    }))
                };
            }
        }

        // Update student details
        const updatedStudent = await client.student.update({
            where: { id },
            data: updateData,
            include: {
                tutors: true,
                scheduledClasses: true,
                courses: {
                    include: {
                        course: true
                    }
                }
            }
        });

        return NextResponse.json(updatedStudent);
    } catch (error) {
        console.error("Error updating student:", error.message);
        return NextResponse.json(
            { message: "Error updating student", error: error.message },
            { status: 500 }
        );
    }
};

// DELETE a student by ID
export const DELETE = async (request, { params }) => {
    try {
        const { id } = params;

        if (!id) {
            throw new Error("Invalid student ID");
        }

        // Delete all related StudentCourse entries before deleting the student
        await client.studentCourse.deleteMany({
            where: { studentId: id }
        });

        const deletedStudent = await client.student.delete({
            where: {
                id
            }
        });

        if (!deletedStudent) {
            return NextResponse.json({ message: "Student not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Student deleted successfully" });
    } catch (error) {
        console.error("Error deleting student:", error);
        return NextResponse.json({ message: "Error deleting student", error: error.message }, { status: 500 });
    }
};
