import z from "zod";

export const signUpSchema = z.object({
    firstName: z.string().min(2,"Tên phải có ít nhất 2 ký tự").max(100,"Tên không được vượt quá 100 ký tự"),
    lastName: z.string().min(2,"Họ phải có ít nhất 2 ký tự").max(100,"Họ không được vượt quá 100 ký tự"),
    username: z.string().min(6,"Username phải có ít nhất 6 ký tự").max(20,"Username không được vượt quá 20 ký tự").regex(/^[a-zA-Z0-9_]+$/,"Username chỉ được chứa chữ cái, số và dấu gạch dưới"),
    email: z.email("Email không hợp lệ"),
    password: z.string().min(8,"Mật khẩu phải có ít nhất 8 ký tự").max(100,"Mật khẩu không được vượt quá 100 ký tự"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"]
});

export const signInSchema = z.object({
    username: z.string().min(6,"Username phải có ít nhất 6 ký tự").max(20,"Username không được vượt quá 20 ký tự").regex(/^[a-zA-Z0-9_]+$/,"Username chỉ được chứa chữ cái, số và dấu gạch dưới"),
    password: z.string().min(1, "Mật khẩu không được để trống")
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type SignInFormValues = z.infer<typeof signInSchema>;
