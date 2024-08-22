import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";


const MAX_CAPACITY = 4; // Maximum capacity for a class

export const POST = async (req) => {
    try {
        const body = await req.json();
        const { classDatestart, classDateend, status, tutorIds = [], studentIds = [], courseId } = body;

        console.log("Received data:", body);

        // Validate that status is provided and is valid
        if (!status || !['BOOKED_OFF', 'NOT_BOOKED_OFF'].includes(status)) {
            throw new Error("Invalid or missing status value.");
        }

        // Validate and format classDatestart and classDateend
        const formattedClassDatestart = new Date(classDatestart).toISOString();
        const formattedClassDateend = new Date(classDateend).toISOString();

        console.log("Formatted classDatestart:", formattedClassDatestart);
        console.log("Formatted classDateend:", formattedClassDateend);

        // Fetch the course name
        const course = await client.course.findUnique({
            where: { id: courseId },
            select: { courseName: true }
        });

        if (!course) {
            throw new Error("Course not found");
        }

        // Fetch tutor names
        const tutors = await client.tutor.findMany({
            where: { id: { in: tutorIds } },
            select: { name: true },
        });
        const tutorNames = tutors.map(tutor => tutor.name);

        // Fetch student names
        const students = await client.student.findMany({
            where: { id: { in: studentIds } },
            select: { name: true },
        });
        const studentNames = students.map(student => student.name);

        // Create the scheduled class with the course relation, tutor names, and student names
        const newScheduledClass = await client.scheduledClass.create({
            data: {
                classDatestart: formattedClassDatestart,
                classDateend: formattedClassDateend,
                status,
                course: { connect: { id: courseId } }, // Connect to the course using its ID
                courseName: course.courseName, // Store the courseName directly
                tutorNames, // Store tutor names
                studentNames, // Store student names
                currentEnrollment: studentIds.length,
                capacity: MAX_CAPACITY,
                tutors: {
                    create: tutorIds.map(tutorId => ({
                        tutor: {
                            connect: { id: tutorId },
                        },
                    })),
                },
                students: {
                    create: studentIds.map(studentId => ({
                        student: {
                            connect: { id: studentId },
                        },
                    })),
                },
            },
        });

        console.log("Created scheduled class:", newScheduledClass);

        return NextResponse.json(newScheduledClass);
    } catch (error) {
        console.error("Error creating scheduled class:", error.message);
        return NextResponse.json(
            { message: "Error creating scheduled class", error: error.message },
            { status: 500 }
        );
    }
};



// GET - Retrieve scheduled classes, tutors, or students based on query parameters
export const GET = async (req) => {
    try {
        const url = new URL(req.url);
        const tutorIds = url.searchParams.get("tutorIds");
        const studentIds = url.searchParams.get("studentIds");

        if (tutorIds) {
            const ids = tutorIds.split(','); // Convert comma-separated IDs to array
            const tutors = await client.tutor.findMany({
                where: {
                    id: { in: ids }
                },
                select: {
                    id: true,
                    name: true,
                    contact: true,
                },
            });
            return NextResponse.json(tutors);
        }

        if (studentIds) {
            const ids = studentIds.split(','); // Convert comma-separated IDs to array
            const students = await client.student.findMany({
                where: {
                    id: { in: ids }
                },
                select: {
                    id: true,
                    name: true,
                    contact: true,
                },
            });
            return NextResponse.json(students);
        }

        // If no specific IDs are provided, fetch all scheduled classes
        const scheduledClasses = await client.scheduledClass.findMany({
            include: {
                tutors: {
                    include: {
                        tutor: {
                            select: {
                                id: true,
                                name: true,
                                contact: true,
                            }
                        }
                    }
                },
                students: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                contact: true,
                            }
                        }
                    }
                },
                course: {
                    select: {
                        id: true,
                        courseName: true,
                    }
                },
            },
        });

        return NextResponse.json(scheduledClasses);
    } catch (error) {
        console.error("Error fetching data:", error.message);
        return NextResponse.json(
            { message: "Error fetching data", error: error.message },
            { status: 500 }
        );
    }
};
