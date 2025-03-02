import NextAuth from "next-auth/next";
import prisma from '../../../libs/prismadb';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt';



export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        // GoogleProvider({
        //     clientId: process.env.GOOGLE_ID,
        //     clientSecret: process.env.GOOGLE_SECRET
        // }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: {label: "Email", type: "text", placeholder: "kar@g.com"},
                password: {label: "Password", type: "password"},
                username: {label: "Username", type: "text", placeholder: "Kar k"}
            },
            async authorize(credentials) {
                // const user = {id: 1, name: "dummy", email: "dummy@hotmail.com"}
                // return user;

                // check to see if email and password is put in

                if (!credentials.email || !credentials.password) {
                    throw new Error("Please enter email and password");
                }


                // check to see if user exists
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                // if user does not exist, throw error

                if (!user || !user?.hashedPassword) {
                    throw new Error('user not found');
                }

                // check to see if password is correct

                const passwordMatch = await bcrypt.compare(credentials.password, user.hashedPassword);

                // if password is incorrect, throw error

                if (!passwordMatch) {
                    throw new Error('Password incorrect');
                }

                return user;

            }
        })
    ],

    callbacks: {
        async jwt({token, user, session}) {
            console.log('jwt callback', {token, user, session});
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    
                };
            }
            return token;
        },
        async session({session, token, user}) {
            console.log('session callback', {session, token, user});
            
            return {
                ...session,
                user: {
                    id: token.id,
                    email: token.email,
                    name: token.name,
                    
                }
            };
            
            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST}
