import { Metadata } from "next";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact us page",
};

export default function ContactPage() {
  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold mb-4">About Us</h1>
      <hr className="border-gray-300 mb-6" />

      <div className="prose prose-lg max-w-none mb-8">
        <p>
          If you have any questions, suggestions, touching, or inspiring stories
          or you just want to connect with me, I would love to hear from you!
        </p>
        <p className="mt-4">
          Please leave me an email through the Contact Form and I will get back
          with you as soon as possible. Otherwise, join us at our Facebook Group
          Middle Aged Humor.
        </p>
        <p className="mt-4">
          We are only middle aged once, so stay classy and a bit bad assy!
        </p>
      </div>

      <form className="max-w-xl space-y-4">
        <div>
          <label
            htmlFor="nameInput"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your name
          </label>
          <input
            type="text"
            id="nameInput"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            aria-describedby="nameHelp"
          />
        </div>

        <div>
          <label
            htmlFor="emailInput"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Email
          </label>
          <input
            type="email"
            id="emailInput"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label
            htmlFor="subjectInput"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subject
          </label>
          <input
            type="text"
            id="subjectInput"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label
            htmlFor="messageInput"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your message (optional)
          </label>
          <textarea
            id="messageInput"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-y"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
        >
          Submit
        </button>
      </form>
    </Container>
  );
}
