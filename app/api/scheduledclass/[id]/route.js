import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// GET specific scheduled class by ID
export const GET = async (request, { params }) => {
    try {
        const { id } = params;

        const scheduledClass = await client.scheduledClass.findUnique({
            where: {
                id
            },
            include: {
                students: {
                    include: {
                        student: true // Include associated students
                    }
                },
                tutors: {
                    include: {
                        tutor: true // Include associated tutors
                    }
                }
            }
        });

        if (!scheduledClass) {
            return NextResponse.json({ message: "Scheduled class not found" }, { status: 404 });
        }

        return NextResponse.json(scheduledClass);
    } catch (error) {
        return NextResponse.json({ message: "Error getting scheduled class", error }, { status: 500 });
    }
};

// PATCH update a scheduled class by ID

export const PATCH = async (req, { params }) => {
    try {
        const { id } = params;
        const body = await req.json();
        const {
            classDatestart,
            classDateend,
            status,
            bookedOffBy,
            tutorIds = [],
            studentIds = [],
        } = body;

        console.log("Received data for update:", body);

        // Build the update data dynamically, excluding undefined values
        const updateData = {
            ...(classDatestart !== undefined && { classDatestart }),
            ...(classDateend !== undefined && { classDateend }),
            ...(status !== undefined && { status }),
            ...(bookedOffBy !== undefined && { bookedOffBy }),
        };

        // Update the tutors for the class
        if (tutorIds.length > 0) {
            updateData.tutors = {
                set: tutorIds.map((tutorId) => ({
                    tutor: { connect: { id: tutorId } },
                })),
            };
        }

        // Update the students for the class
        if (studentIds.length > 0) {
            updateData.students = {
                set: studentIds.map((studentId) => ({
                    student: { connect: { id: studentId } },
                })),
            };
        }

        // Update the scheduled class with the provided data
        const updatedClass = await client.scheduledClass.update({
            where: { id },
            data: updateData,
            include: {
                tutors: { include: { tutor: true } },
                students: { include: { student: true } },
            },
        });

        console.log("Updated class:", updatedClass);
        return NextResponse.json(updatedClass);
    } catch (error) {
        console.error("Error updating class:", error.message);
        return NextResponse.json(
            { message: "Error updating class", error: error.message },
            { status: 500 }
        );
    }
};


// DELETE a scheduled class by ID


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
