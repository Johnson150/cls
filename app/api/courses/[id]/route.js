import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// Function to handle GET requests to fetch a course by ID
export const GET = async (request, { params }) => {
    try {
        const { id } = params;

        const course = await client.course.findUnique({
            where: {
                id: id,
            },
            include: {
                tutors: true, // Include associated tutors if needed
                students: true, // Include associated students if needed
                scheduledClasses: true, // Include associated scheduled classes if needed
            },
        });

        if (!course) {
            return NextResponse.json({ message: "Course not found" }, { status: 404 });
        }

        return NextResponse.json(course);
    } catch (error) {
        console.error("Error fetching course:", error);
        return NextResponse.json(
            { message: "Error fetching course", error: error.message },
            { status: 500 }
        );
    }
};
