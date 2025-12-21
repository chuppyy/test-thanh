import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type FormFieldProps = {
  label: string;
  id: string;
  type?: "text" | "email" | "textarea";
  required?: boolean;
  className?: string;
};

type InputProps = FormFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id">;
type TextareaProps = FormFieldProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id">;

export const FormField = ({
  label,
  id,
  type = "text",
  required = false,
  className = "",
  ...props
}: InputProps | TextareaProps) => {
  const inputClasses =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          id={id}
          className={inputClasses}
          rows={4}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          type={type}
          id={id}
          className={inputClasses}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </div>
  );
};
