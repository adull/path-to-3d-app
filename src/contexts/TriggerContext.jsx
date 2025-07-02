import { createContext, useContext, useState } from 'react'

const TriggerContext = createContext()

export const useTrigger = () => {
    return useContext(TriggerContext)
}

export const TriggerProvider = ({ children }) => {
    const [triggerSignal, setTriggerSignal] = useState(0)

    const triggerFn = () => {
        console.log(`trigger that ass`)
        setTriggerSignal(triggerSignal + 1)
    }

    return (
        <TriggerContext.Provider value={{ triggerSignal, triggerFn }}>
            {children}
        </TriggerContext.Provider>
    )
}
