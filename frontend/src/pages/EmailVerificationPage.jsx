import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function EmailVerificationPage() {
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef([]);
	const navigate = useNavigate();
	const { error, isLoading, verifyEmail } = useAuthStore();

	const handleChange = (index, value) => {
		const newCode = [...code];

		if (value.length > 1) {
			const pastedCode = value.slice(0, 6).split("");
			for (let i = 0; i < 6; i++) {
				newCode[i] = pastedCode[i] || "";
			}
			setCode(newCode);
			const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
			const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
			inputRefs.current[focusIndex].focus();
		} else {
			newCode[index] = value;
			setCode(newCode);
			if (value && index < 5) {
				inputRefs.current[index + 1].focus();
			}
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1].focus();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const verificationCode = code.join("");
		try {
			await verifyEmail(verificationCode);
			navigate("/login");
			toast.success("Email verified successfully");
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (code.every((digit) => digit !== "")) {
			handleSubmit(new Event("submit"));
		}
	}, [code]);

	return (
		<div className="container mt-5 d-flex justify-content-center">
			<div className="card p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
				<h2 className="text-center mb-3 text-success">Verify Your Email</h2>
				<p className="text-center text-muted mb-4">
					Enter the 6-digit code sent to your email address.
				</p>
				<form onSubmit={handleSubmit}>
					<div className="d-flex justify-content-between mb-3">
						{code.map((digit, index) => (
							<input
								key={index}
								ref={(el) => (inputRefs.current[index] = el)}
								type="text"
								maxLength="1"
								value={digit}
								onChange={(e) => handleChange(index, e.target.value)}
								onKeyDown={(e) => handleKeyDown(index, e)}
								className="form-control text-center mx-1"
								style={{
									width: "50px",
									height: "50px",
									fontSize: "1.5rem",
									fontWeight: "bold",
								}}
							/>
						))}
					</div>
					{error && (
						<p className="text-danger text-center fw-semibold">{error}</p>
					)}
					<button
						type="submit"
						className="btn btn-success w-100"
						disabled={isLoading || code.some((digit) => !digit)}
					>
						{isLoading ? "Verifying..." : "Verify Email"}
					</button>
				</form>
			</div>
		</div>
	);
}
