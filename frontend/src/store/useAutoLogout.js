import { useEffect } from "react";
import { jwtDecode } from 'jwt-decode';


const useAutoLogout = (token, logoutFn, inactivityTimeout = 5* 60 * 1000) => {
    useEffect(() => {
        if (!token) return;

        // if token expire then auto logout
        let decode;
        let tokenExpiryTimer;
        console.log(inactivityTimeout);
        
        try {
            decode = jwtDecode(token);
            console.log("decoded token: ", decode);
            const expiryTime = decode.exp * 1000;
            const currentTime = Date.now()

            if (currentTime >= expiryTime) {
                logoutFn()
            } else {
                tokenExpiryTimer = setTimeout(() => {
                    logoutFn();
                }, expiryTime - currentTime);

            }

        } catch (error) {
            console.log(error);
            logoutFn();

        }


        // Inactivity on site 
        let inactivityTimer;

        const resetInactivityTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                logoutFn();
            }, inactivityTimeout);
        }

        const activityEvents = ['mousemove', 'keydown', "click", 'scroll', 'touchstart']

        activityEvents.forEach(event =>
            window.addEventListener(event, resetInactivityTimer)
        )

        resetInactivityTimer();

        return () => {
            clearTimeout(tokenExpiryTimer);
            clearTimeout(inactivityTimer);
            activityEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer))
        }

    }, [token, logoutFn, inactivityTimeout])

}

export default useAutoLogout;