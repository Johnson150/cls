'use client'

import{SessionProvider} from 'next-auth/react'

export default function Provider({children}){
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}

//to provide session around children components in layout file
