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
            select: {
                id: true,
                name: true,
                hoursWorked: true,
                hoursScheduled: true,
                timesBookedOff: true, // Include timesBookedOff
                students: true, // Include associated students
                scheduledClasses: true, // Include associated scheduled classes
                courses: true, // Include associated courses
            }
        });

        if (!tutor) {
            return NextResponse.json({ message: "Tutor not found" }, { status: 404 });
        }

        return NextResponse.json(tutor);
    } catch (error) {
        return NextResponse.json({ message: "Error getting tutor", error }, { status: 500 });
    }
};



export const PATCH = async (request, { params }) => {
    try {
        const body = await request.json();
        const { id } = params;
        const { name, hoursWorked, hoursScheduled, timesBookedOff } = body;

        const updatedTutor = await client.tutor.update({
            where: {
                id
            },
            data: {
                name,
                hoursWorked,
                hoursScheduled,
                timesBookedOff, // Update timesBookedOff if provided
            }
        });

        if (!updatedTutor) {
            return NextResponse.json({ message: "Tutor not found" }, { status: 404 });
        }

        return NextResponse.json(updatedTutor);
    } catch (error) {
        return NextResponse.json({ message: "Error updating tutor", error }, { status: 500 });
    }
};


// DELETE a tutor by ID
export const DELETE = async (request, { params }) => {
    try {
        const { id } = params;

        const deletedTutor = await client.tutor.delete({
            where: {
                id
            },
            include: {
                students: true, // Optionally include associated relations
                scheduledClasses: true,
                courses: true,
            }
        });

        if (!deletedTutor) {
            return NextResponse.json({ message: "Tutor not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Tutor deleted successfully" });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting tutor", error }, { status: 500 });
    }
};
