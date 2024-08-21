import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    try {
        const body = await req.json();
        let { classDatestart, classDateend, status, tutorIds = [], studentIds = [] } = body;

        console.log("Received data:", body);

        // Validate that status is provided and is valid
        if (!status || !['BOOKED_OFF', 'NOT_BOOKED_OFF'].includes(status)) {
            throw new Error("Invalid or missing status value.");
        }

        // Validate and format classDatestart and classDateend
        if (typeof classDatestart === 'string') {
            classDatestart = new Date(classDatestart).toISOString();
        } else if (classDatestart instanceof Date) {
            classDatestart = classDatestart.toISOString();
        } else {
            throw new Error("Invalid date format for classDatestart.");
        }

        if (typeof classDateend === 'string') {
            classDateend = new Date(classDateend).toISOString();
        } else if (classDateend instanceof Date) {
            classDateend = classDateend.toISOString();
        } else {
            throw new Error("Invalid date format for classDateend.");
        }

        console.log("Formatted classDatestart:", classDatestart);
        console.log("Formatted classDateend:", classDateend);

        // Create the scheduled class
        const newScheduledClass = await client.scheduledClass.create({
            data: {
                classDatestart,
                classDateend,
                status,
            },
        });

        console.log("Created scheduled class:", newScheduledClass);

        // Link tutors to the scheduled class
        if (tutorIds.length > 0) {
            for (const tutorId of tutorIds) {
                const tutorLink = await client.tutorScheduledClass.create({
                    data: {
                        tutorId,
                        scheduledClassId: newScheduledClass.id,
                    },
                });
                console.log("Tutor Linked:", tutorLink);
            }
        }

        // Link students to the scheduled class
        if (studentIds.length > 0) {
            for (const studentId of studentIds) {
                const studentLink = await client.studentScheduledClass.create({
                    data: {
                        studentId,
                        scheduledClassId: newScheduledClass.id,
                    },
                });
                console.log("Student Linked:", studentLink);
            }
        }

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
