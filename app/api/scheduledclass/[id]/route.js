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
export const PATCH = async (request, { params }) => {
    try {
        const body = await request.json();
        const { id } = params;
        const { classDate, duration, status, bookedOffBy } = body;

        const updatedData = {
            classDate,
            duration,
            status,
        };

        // Include bookedOffBy field only if it is provided
        if (bookedOffBy) {
            updatedData.bookedOffBy = bookedOffBy;
        }

        const updatedScheduledClass = await client.scheduledClass.update({
            where: {
                id
            },
            data: updatedData,
        });

        if (!updatedScheduledClass) {
            return NextResponse.json({ message: "Scheduled class not found" }, { status: 404 });
        }

        return NextResponse.json(updatedScheduledClass);
    } catch (error) {
        return NextResponse.json({ message: "Error updating scheduled class", error }, { status: 500 });
    }
};

// DELETE a scheduled class by ID
export const DELETE = async (request, { params }) => {
    try {
        const { id } = params;

        const deletedScheduledClass = await client.scheduledClass.delete({
            where: {
                id
            }
        });

        if (!deletedScheduledClass) {
            return NextResponse.json({ message: "Scheduled class not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Scheduled class deleted successfully" });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting scheduled class", error }, { status: 500 });
    }
};
