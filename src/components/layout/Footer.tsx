import { VARIABLES } from "@/constant/variables";

export const Footer = () => {
  return (
    <footer className="py-6 text-center">
      <p className="font-semibold text-gray-600">© {VARIABLES.year} - TKT</p>
    </footer>
  );
};
