import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    try {
        const body = await req.json();
        const { name, hoursin, hoursscheduled, timesbookedoff = 0, contact, tutorIds = [], scheduledClassIds = [], courseIds = [] } = body;

        // Verify that all courses exist
        const existingCourses = await client.course.findMany({
            where: { id: { in: courseIds } }
        });

        if (existingCourses.length !== courseIds.length) {
            throw new Error("One or more selected courses were not found.");
        }

        // Proceed to create the student with the associated tutors, scheduled classes, and courses
        const newStudent = await client.student.create({
            data: {
                name,
                hoursin,
                hoursscheduled,
                timesbookedoff,
                contact,
                // Connect tutors
                tutors: {
                    create: tutorIds.map((tutorId) => ({
                        tutor: { connect: { id: tutorId } }
                    }))
                },
                // Connect scheduled classes
                scheduledClasses: {
                    create: scheduledClassIds.map((scheduledClassId) => ({
                        scheduledClass: { connect: { id: scheduledClassId } }
                    }))
                },
                // Connect courses
                courses: {
                    create: existingCourses.map((course) => ({
                        course: { connect: { id: course.id } }
                    })),
                },
            },
        });

        return NextResponse.json(newStudent);
    } catch (error) {
        console.error("Error creating student:", error.message);
        return NextResponse.json(
            { message: "Error creating student", error: error.message },
            { status: 500 }
        );
    }
};


export const GET = async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const courseIdsParam = searchParams.get('courseIds');
        const courseIds = courseIdsParam ? courseIdsParam.split(',') : [];

        let students;

        if (courseIds.length > 0) {
            // Fetch students who are associated with any of the specified courses
            students = await client.student.findMany({
                where: {
                    courses: {
                        some: {
                            course: {
                                id: { in: courseIds },
                            },
                        },
                    },
                },
                select: {
                    id: true,
                    name: true,
                    hoursin: true,
                    hoursscheduled: true,
                    timesbookedoff: true,
                    contact: true,
                    tutors: {
                        select: {
                            tutor: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    scheduledClasses: {
                        select: {
                            scheduledClass: {
                                select: {
                                    id: true,
                                    classDate: true, // Include only specific fields as needed
                                },
                            },
                        },
                    },
                    courses: {
                        select: {
                            course: {
                                select: {
                                    id: true,
                                    courseName: true, // Assuming you want to include the course name
                                },
                            },
                        },
                    },
                },
            });

            if (!students.length) {
                return NextResponse.json({ message: "No students found for these courses" }, { status: 404 });
            }
        } else {
            // Fetch all students if no courseIds are provided
            students = await client.student.findMany({
                select: {
                    id: true,
                    name: true,
                    hoursin: true,
                    hoursscheduled: true,
                    timesbookedoff: true,
                    contact: true,
                    tutors: {
                        select: {
                            tutor: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    scheduledClasses: {
                        select: {
                            scheduledClass: {
                                select: {
                                    id: true,
                                    classDate: true, // Include only specific fields as needed
                                },
                            },
                        },
                    },
                    courses: {
                        select: {
                            course: {
                                select: {
                                    id: true,
                                    courseName: true, // Assuming you want to include the course name
                                },
                            },
                        },
                    },
                },
            });
        }

        return NextResponse.json(students);
    } catch (error) {
        console.error("Error getting students:", error.message);
        return NextResponse.json(
            { message: "Error getting students", error: error.message },
            { status: 500 }
        );
    }
};
