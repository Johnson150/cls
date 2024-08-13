import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// GET specific tutor-scheduled class relationship by ID
export const GET = async (request, { params }) => {
    try {
        const { id } = params;

        const tutorScheduledClass = await client.tutorScheduledClass.findUnique({
            where: {
                id
            },
            include: {
                tutor: true,
                scheduledClass: true
            }
        });

        if (!tutorScheduledClass) {
            return NextResponse.json({ message: "Tutor-scheduled class relationship not found" }, { status: 404 });
        }

        return NextResponse.json(tutorScheduledClass);
    } catch (error) {
        return NextResponse.json({ message: "Error getting tutor-scheduled class relationship", error }, { status: 500 });
    }
};

// DELETE a tutor-scheduled class relationship by ID
export const DELETE = async (request, { params }) => {
    try {
        const { id } = params;

        const deletedTutorScheduledClass = await client.tutorScheduledClass.delete({
            where: {
                id
            }
        });

        if (!deletedTutorScheduledClass) {
            return NextResponse.json({ message: "Tutor-scheduled class relationship not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Tutor-scheduled class relationship deleted successfully" });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting tutor-scheduled class relationship", error }, { status: 500 });
    }
};
