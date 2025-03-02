'use client'

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Header from "../../components/Header"

export default function Signup() {

    const [data, setData] = useState({name: '', email: '', password: ''})
    const [emailError, setEmailError] = useState('')

    const router = useRouter()

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
        return re.test(String(email).toLowerCase())
    }

    const registerUser = async (e) => {
        e.preventDefault()
        
        if (!validateEmail(data.email)) {
            setEmailError('Please enter a valid email address.')
            return
        }

        axios.post('/api/newregister', data)
        .then(()=> {
            alert('User has been registered')
            console.log('User has been registered', data)
            router.push('/login')
        })
        .catch(()=>alert('Something went wrong'))
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-700">
            <Header />
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className= "text-center text-2xl font-bold leading-9 tracking-tight text-white">
                        Register for an account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={registerUser}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-white">
                                Name
                            </label>
                            <div className="mt-2">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={e => setData({...data, name: e.target.value})}
                                    className="mt-1 block w-full p-2 border text-black rounded-md shadow-sm focus:ring focus:ring-indigo-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={data.email}
                                    onChange={e => {
                                        setData({...data, email: e.target.value})
                                        setEmailError('')
                                    }}
                                    className="mt-1 block w-full p-2 border text-black rounded-md shadow-sm focus:ring focus:ring-indigo-200"
                                />
                                {emailError && <p className="mt-2 text-sm text-red-600">{emailError}</p>}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                                    Password
                                </label>
                                {/* <div className="text-sm">
                                    <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                        Forgot password?
                                    </a>
                                </div> */}
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={data.password}
                                    onChange={e => setData({...data, password: e.target.value})}
                                   className="mt-1 block w-full p-2 border text-black rounded-md shadow-sm focus:ring focus:ring-indigo-200"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Register
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 space-y-4 text-center">
                        <p className="text-sm text-white">Already have an account?</p>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-indigo-900 text-white text-sm font-semibold py-2 rounded-md shadow-md hover:bg-indigo-800 transition duration-200"
                        >
                            Go to Login Page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

