import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// GET specific tutor by ID
export const GET = async (request, { params }) => {
    try {
        const { id } = params;

        const tutor = await client.tutor.findUnique({
            where: {
                id
            },
            include: {
                students: true, // Include associated students
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

        if (!tutor) {
            return NextResponse.json({ message: "Tutor not found" }, { status: 404 });
        }

        return NextResponse.json(tutor);
    } catch (error) {
        return NextResponse.json({ message: "Error getting tutor", error: error.message }, { status: 500 });
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
            studentIds = [],
            scheduledClassIds = [],
            hoursScheduled = 0,
            hoursScheduledAt,
        } = body;

        console.log("Received data for update:", body);

        // Build the update data dynamically, excluding undefined values
        const updateData = {
            ...(name !== undefined && { name }),
            ...(contact !== undefined && { contact }),
            ...(hoursScheduled !== undefined && {
                hoursScheduled: {
                    increment: hoursScheduled, // Increment the hours scheduled by the class duration
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

        // Handle student updates separately to avoid clearing them
        if (studentIds.length > 0) {
            updateData.students = {
                set: studentIds.map((studentId) => ({ id: studentId })),
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

        // Update the tutor with the new data
        const updatedTutor = await client.tutor.update({
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

        console.log("Updated tutor:", updatedTutor);
        return NextResponse.json(updatedTutor);
    } catch (error) {
        console.error("Error updating tutor:", error.message);
        return NextResponse.json(
            { message: "Error updating tutor", error: error.message },
            { status: 500 }
        );
    }
};










// DELETE a tutor by ID
export const DELETE = async (request, { params }) => {
    try {
        const { id } = params;

        if (!id) {
            throw new Error("Invalid tutor ID");
        }

        // Delete all related TutorScheduledClass entries before deleting the tutor
        await client.tutorScheduledClass.deleteMany({
            where: { tutorId: id }
        });

        // Delete all related TutorCourse entries before deleting the tutor
        await client.tutorCourse.deleteMany({
            where: { tutorId: id }
        });

        // Now delete the tutor
        const deletedTutor = await client.tutor.delete({
            where: {
                id
            }
        });

        if (!deletedTutor) {
            return NextResponse.json({ message: "Tutor not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Tutor deleted successfully" });
    } catch (error) {
        console.error("Error deleting tutor:", error.message);
        return NextResponse.json({ message: "Error deleting tutor", error: error.message }, { status: 500 });
    }
};
