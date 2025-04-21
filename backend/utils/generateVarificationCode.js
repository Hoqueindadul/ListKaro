export const generateVarificationCode = () => {
    // This generates a 6-digit random number as a string
    return Math.floor(100000 + Math.random() * 900000).toString();
    
}