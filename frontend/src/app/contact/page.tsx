"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

// Define contact form state type
interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  organization: string;
  subject: string;
  message: string;
  inquiryType: string;
}

// Initial state for the form
const initialFormState: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  organization: "",
  subject: "",
  message: "",
  inquiryType: "general",
};

export default function ContactPage() {
  // Form state
  const [formState, setFormState] =
    useState<ContactFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare the data for Strapi's API format
      const formData = {
        data: {
          name: formState.name,
          email: formState.email,
          subject: formState.subject,
          message: formState.message,
          inquiryType: formState.inquiryType,
          // Include these if you added them to your Strapi model
          phone: formState.phone || undefined,
          organization: formState.organization || undefined,
        },
      };

      // Send the data to Strapi API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contact-messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      // Parse the response
      const result = await response.json();

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to submit form");
      }

      // Reset form and show success message
      setFormState(initialFormState);
      setSubmitSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

      console.log("Form submitted successfully:", result);
    } catch (error: unknown) {
      setSubmitError(
        (error instanceof Error ? error.message : null) ||
          "There was a problem submitting your form. Please try again."
      );
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ContactOptionsSection />
      <ContactFormSection
        formState={formState}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitSuccess={submitSuccess}
        submitError={submitError}
      />
      <SocialMediaSection />
      <FAQTeaserSection />
    </main>
  );
}

// -------------------------------------------------------------------
// Hero Section
// -------------------------------------------------------------------
function HeroSection() {
  return (
    <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block mb-3 h-1 w-16 bg-yellow-500"></span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Get in touch with our team about CFC Events
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" href="#contact-form">
                Send a Message
              </Button>
              <Button
                variant="dark"
                buttonType="outline"
                href="tel:+256700000000"
                className="dark:border-white dark:text-white"
              >
                Call Us
              </Button>
            </div>
          </div>
          <div className="bg-black text-white dark:bg-white dark:text-black p-8 border border-gray-200 dark:border-gray-600">
            <div className="relative">
              <div className="absolute top-0 right-0 w-12 h-12 bg-yellow-500"></div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">Email</p>
                    <p>info@uniteexpo.org</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">Phone</p>
                    <p>+256 700 000 000</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">Address</p>
                    <p>Plot 123, Kampala Road</p>
                    <p>Kampala, Uganda</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// Contact Options Section
// -------------------------------------------------------------------
function ContactOptionsSection() {
  const contactOptions = [
    {
      title: "General Inquiries",
      description:
        "Have questions about the expo? Our team is ready to assist you.",
      email: "info@uniteexpo.org",
      phone: "+256 700 000 000",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Sponsorship Opportunities",
      description:
        "Interested in sponsoring CFC Events? Explore our sponsorship packages.",
      email: "sponsors@uniteexpo.org",
      phone: "+256 700 000 001",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Media & Press",
      description:
        "For media inquiries, press passes, and promotional materials.",
      email: "media@uniteexpo.org",
      phone: "+256 700 000 002",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="inline-block mb-3 h-1 w-16 bg-blue-600"></span>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            How Can We Help?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Reach out to our dedicated teams for specific inquiries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactOptions.map((option, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
            >
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-black dark:bg-white h-12 w-12 flex items-center justify-center mr-4">
                    <div className="text-white dark:text-black">
                      {option.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {option.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {option.description}
                </p>
                <div className="space-y-2">
                  <a
                    href={`mailto:${option.email}`}
                    className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    {option.email}
                  </a>
                  <a
                    href={`tel:${option.phone.replace(/\s+/g, "")}`}
                    className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    {option.phone}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// Contact Form Section
// -------------------------------------------------------------------
function ContactFormSection({
  formState,
  handleChange,
  handleSubmit,
  isSubmitting,
  submitSuccess,
  submitError,
}: {
  formState: ContactFormState;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError: string | null;
}) {
  return (
    <section
      id="contact-form"
      className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <span className="inline-block mb-3 h-1 w-16 bg-yellow-500"></span>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Send Us a Message
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Whether you have a question about the expo, sponsorship
              opportunities, or anything else, our team is ready to answer all
              your questions.
            </p>

            {/* Success Message */}
            {submitSuccess && (
              <div className="mb-8 p-4 bg-black text-white dark:bg-white dark:text-black border border-yellow-500">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">
                      Message sent successfully
                    </h3>
                    <p className="mt-2 text-sm">
                      Thank you for contacting us. We&apos;ll get back to you
                      shortly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="mb-8 p-4 bg-black text-white dark:bg-white dark:text-black border border-red-500">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">There was an error</h3>
                    <p className="mt-2 text-sm">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formState.phone}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="organization"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Organization/Company
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formState.organization}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="inquiryType"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Inquiry Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="inquiryType"
                  name="inquiryType"
                  value={formState.inquiryType}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-500"
                  required
                >
                  <option value="general">General Inquiry</option>
                  <option value="sponsorship">Sponsorship Inquiry</option>
                  <option value="exhibitor">Exhibitor Information</option>
                  <option value="speaker">Speaker Opportunity</option>
                  <option value="media">Media & Press</option>
                  <option value="ticket">Ticketing Support</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formState.subject}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formState.message}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-500"
                  required
                ></textarea>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div>
            <div className="border border-gray-200 dark:border-gray-600 h-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Visit Us
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Our office is open Monday through Friday, 9:00 AM to 5:00 PM
                  (EAT).
                </p>
              </div>

              <div className="p-6 border-b border-gray-200 dark:border-gray-600">
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1 bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      <p className="font-medium text-black dark:text-white">
                        CFC Events Headquarters
                      </p>
                      <p>Plot 123, Kampala Road</p>
                      <p>Kampala, Uganda</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1 bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      <p className="font-medium text-black dark:text-white">
                        Main Phone
                      </p>
                      <p>+256 700 000 000</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1 bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      <p className="font-medium text-black dark:text-white">
                        Email
                      </p>
                      <p>info@uniteexpo.org</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Embed */}
              <div className="h-64 w-full border-b border-gray-200 dark:border-gray-600">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7575293756577!2d32.573971299999994!3d0.316619!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbb0afbb1ae1d%3A0x3c240fcd8cc8df7!2sKampala%20Rd%2C%20Kampala%2C%20Uganda!5e0!3m2!1sen!2sus!4v1649919564388!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="p-6">
                <Button
                  variant="dark"
                  buttonType="outline"
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full dark:border-white dark:text-white"
                >
                  Get Directions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// Social Media Section
// -------------------------------------------------------------------
function SocialMediaSection() {
  return (
    <section className="py-16 bg-black text-white dark:bg-white dark:text-black border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-8">Connect With Us</h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-3xl mx-auto mb-8">
          <a
            href="https://twitter.com/uniteexpo"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white dark:border-black p-4 h-16 flex items-center justify-center hover:bg-yellow-500 hover:text-black hover:border-yellow-500 dark:hover:bg-yellow-500 dark:hover:text-black dark:hover:border-yellow-500 transition-colors"
            aria-label="Twitter"
          >
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>

          <a
            href="https://facebook.com/uniteexpo"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white dark:border-black p-4 h-16 flex items-center justify-center hover:bg-yellow-500 hover:text-black hover:border-yellow-500 dark:hover:bg-yellow-500 dark:hover:text-black dark:hover:border-yellow-500 transition-colors"
            aria-label="Facebook"
          >
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                clipRule="evenodd"
              />
            </svg>
          </a>

          <a
            href="https://instagram.com/uniteexpo"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white dark:border-black p-4 h-16 flex items-center justify-center hover:bg-yellow-500 hover:text-black hover:border-yellow-500 dark:hover:bg-yellow-500 dark:hover:text-black dark:hover:border-yellow-500 transition-colors"
            aria-label="Instagram"
          >
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                clipRule="evenodd"
              />
            </svg>
          </a>

          <a
            href="https://linkedin.com/company/uniteexpo"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white dark:border-black p-4 h-16 flex items-center justify-center hover:bg-yellow-500 hover:text-black hover:border-yellow-500 dark:hover:bg-yellow-500 dark:hover:text-black dark:hover:border-yellow-500 transition-colors"
            aria-label="LinkedIn"
          >
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>

          <a
            href="https://youtube.com/uniteexpo"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white dark:border-black p-4 h-16 flex items-center justify-center hover:bg-yellow-500 hover:text-black hover:border-yellow-500 dark:hover:bg-yellow-500 dark:hover:text-black dark:hover:border-yellow-500 transition-colors"
            aria-label="YouTube"
          >
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>

        <p className="text-lg">
          Follow us on social media for the latest updates about CFC Events
        </p>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// FAQ Teaser Section
// -------------------------------------------------------------------
function FAQTeaserSection() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <span className="inline-block mb-3 h-1 w-16 bg-blue-600"></span>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center max-w-2xl">
          Find answers to commonly asked questions about the expo, registration,
          venues, and more.
        </p>
        <Button variant="primary" size="lg" href="/events">
          Browse Events
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ml-2 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>
    </section>
  );
}
