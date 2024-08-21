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
        return NextResponse.json({ message: "Error getting student", error: error.message }, { status: 500 });
    }
};


export const PATCH = async (req, { params }) => {
    try {
        const { id } = params;
        const body = await req.json();
        const {
            name,
            contact,
            courseIds = [],
            tutorIds = [],
            scheduledClassIds = [],
            hoursscheduled = 0,
            hoursScheduledAt,
        } = body;

        console.log("Received data for update:", body);

        // Build the update data dynamically, excluding undefined values
        const updateData = {
            ...(name !== undefined && { name }),
            ...(contact !== undefined && { contact }),
            ...(hoursscheduled !== undefined && {
                hoursScheduled: {
                    increment: hoursscheduled, // Increment the hours scheduled by the class duration
                }
            }),
            ...(hoursScheduledAt !== undefined && { hoursScheduledAt })
        };

        // Handle course updates separately to avoid clearing them
        if (courseIds.length > 0) {
            updateData.courses = {
                set: courseIds.map((courseId) => ({ id: courseId })),
            };
        }

        // Handle tutor updates separately to avoid clearing them
        if (tutorIds.length > 0) {
            updateData.tutors = {
                set: tutorIds.map((tutorId) => ({ id: tutorId })),
            };
        }

        // Handle scheduled class updates
        if (scheduledClassIds.length > 0) {
            updateData.scheduledClasses = {
                create: scheduledClassIds.map((scheduledClassId) => ({
                    scheduledClass: {
                        connect: { id: scheduledClassId },
                    },
                })),
            };
        }

        // Update the student with the new data
        const updatedStudent = await client.student.update({
            where: { id },
            data: updateData,
            include: {
                courses: {
                    select: {
                        course: true,
                    },
                },
            },
        });

        console.log("Updated student:", updatedStudent);
        return NextResponse.json(updatedStudent);
    } catch (error) {
        console.error("Error updating student:", error.message);
        return NextResponse.json(
            { message: "Error updating student", error: error.message },
            { status: 500 }
        );
    }
};






export const DELETE = async (request, { params }) => {
    try {
        const { id } = params;

        if (!id) {
            throw new Error("Invalid student ID");
        }

        // Delete all related StudentScheduledClass entries before deleting the student
        await client.studentScheduledClass.deleteMany({
            where: { studentId: id }
        });

        // Delete all related StudentCourse entries before deleting the student
        await client.studentCourse.deleteMany({
            where: { studentId: id }
        });

        // Now delete the student
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
        console.error("Error deleting student:", error.message);
        return NextResponse.json({ message: "Error deleting student", error: error.message }, { status: 500 });
    }
};
