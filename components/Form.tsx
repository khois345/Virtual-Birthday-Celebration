"use client";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/context/userContext";
import { toast } from "react-toastify";
import { usePathname, useRouter } from "next/navigation";
import { Locale, getLocalePrefix, getTranslations } from "@/i18n/translations";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

interface FormProps {
  locale: Locale;
}

const Form = ({ locale }: FormProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { saveUserData } = useUser();
  const [username, setUsername] = useState<string>("");
  const [userAge, setUserAge] = useState<number>(0);
  const [userRegard, setUserRegard] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const regardRef = useRef<HTMLTextAreaElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const texts = getTranslations(locale);

  // Functions for handling the form data and user interaction--------------------------------------------
  // Age validation
  const handleUserAgeChange = (newAge: number) => {
    if (newAge < 0) {
      return 0;
    } else if (newAge > 120) {
      return 120;
    } else {
      return newAge;
    }
  };

  // Adjust age when the increase/decrease button is clicked and held
  const decreaseAge = () => {
    setUserAge((prevAge) => handleUserAgeChange(prevAge - 1));
  };

  const increaseAge = () => {
    setUserAge((prevAge) => handleUserAgeChange(prevAge + 1));
  };

  // We trigger setInterval to trigger decreaseAge/decreaseAge multiple times when the button is clicked and held
  const handleInteractionStart = (increment: boolean) => {
    const id = setInterval(() => {
      if (increment) {
        increaseAge();
      } else {
        decreaseAge();
      }
    }, 120); // Adjust the interval (the lower the faster) (milliseconds)

    setIntervalId(id);
  };

  const handleInteractionEnd = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  // Set data on submit
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (userAge === 0) {
      toast.warning(texts.form.validationAge, { position: "top-center"});
      return;
    } else if (username === "") {
      toast.warning(texts.form.validationName, { position: "top-center"});
      return;
    }

    // Save user data to database
    setIsSubmitting(true);

    try {
      const newSessionId = await saveUserData({
        name: username,
        age: userAge,
        regard: userRegard || texts.form.defaultRegard,
      });

      if (newSessionId === "RATE_LIMIT") {
        toast.error(texts.form.rateLimit, {
          position: "top-center",
        });
        return;
      }
    
      if (!newSessionId) {
        toast.error(texts.form.saveError, {
          position: "top-center",
        });
        return;
      }

      const localePrefix = getLocalePrefix(pathname);
      router.push(`${localePrefix}/${newSessionId}`);
    } catch {
      toast.error(texts.form.saveError, {
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  //------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleOutside = (e: Event) => {
      const target = e.target as Node;
      if (
        (regardRef.current && regardRef.current.contains(target)) ||
        (pickerRef.current && pickerRef.current.contains(target)) ||
        (emojiButtonRef.current && emojiButtonRef.current.contains(target))
      ) {
        return;
      }
      setShowEmojiPicker(false);
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowEmojiPicker(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [showEmojiPicker]);

  const steps = [
    { icon: "✍️", text: texts.form.stepCreate },
    { icon: "🔗", text: texts.form.stepShare },
    { icon: "🕯️", text: texts.form.stepCelebrate },
  ];

  return (
    <div className="flex flex-col items-center px-4 pt-10 sm:pt-16">
      {/* Intro */}
      <section className="w-full max-w-2xl text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">{texts.form.heroTitle}</h1>
        <p className="mt-3 text-neutral-300 sm:text-lg">{texts.form.heroSubtitle}</p>

        <h2 className="sr-only">{texts.form.howItWorks}</h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-3 text-left">
          {steps.map((step, index) => (
            <li
              key={index}
              className="flex items-start gap-3 rounded-lg bg-neutral-700/60 border border-neutral-600 p-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-800 text-sm font-bold text-white">
                {index + 1}
              </span>
              <span className="text-sm text-neutral-200">
                <span aria-hidden className="mr-1">{step.icon}</span>
                {step.text}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="w-full max-w-sm mt-8">
        <form
          onSubmit={handleSubmit}
          className="text-neutral-300 px-6 pt-8 pb-8 mb-4 rounded-xl shadow-full bg-neutral-700 border-t-4 border-orange-800"
        >
          <h2 className="text-lg font-bold mb-4 text-center">{texts.form.title}</h2>
          
          {/* Name session */}
          <div className="mb-2">
            <label className="block text-md font-bold mb-2">
              {texts.form.nameLabel}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              placeholder={texts.form.namePlaceholder}
              className="shadow appearance-none rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Age session */}
          <div className="mb-2">
            <label className="block text-md font-bold mb-2">
              {texts.form.ageLabel}
            </label>
            <div className="relative flex items-center ">
              <button
                type="button"
                id="decrease-button"
                onMouseDown={() => handleInteractionStart(false)}
                onTouchStart={() => handleInteractionStart(false)}
                onClick={decreaseAge}
                onMouseUp={handleInteractionEnd}
                onTouchEnd={handleInteractionEnd}
                onMouseLeave={handleInteractionEnd}
                className="bg-gray-600 hover:bg-gray-500 border rounded-l-lg p-3 h-9 leading-tight focus:outline-none "
              >
                <svg
                  className="w-3 h-3 text-gray-900 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 18 2"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1h16"
                  />
                </svg>
              </button>
              <input
                type="number"
                value={userAge || ""}
                onChange={(e) => setUserAge(handleUserAgeChange(parseInt(e.target.value)))}
                placeholder={texts.form.agePlaceholder}
                className="shadow appearance-none w-full py-2 text-gray-700 text-center leading-tight focus:outline-none"
              />
              <button
                type="button"
                id="increase-button"
                onMouseDown={() => handleInteractionStart(true)}
                onTouchStart={() => handleInteractionStart(true)}
                onClick={increaseAge}
                onMouseUp={handleInteractionEnd}
                onTouchEnd={handleInteractionEnd}
                onMouseLeave={handleInteractionEnd}
                className="bg-gray-600 hover:bg-gray-500 border rounded-e-lg p-3 h-9 leading-tight outline-none"
              >
                <svg
                  className="w-3 h-3 text-gray-900 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 18 18"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 1v16M1 9h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Regards session */}
          <div className="mb-2">
            <label className="block text-md font-bold mb-2">
              {texts.form.regardLabel}
            </label>
            <div className="relative">
              <textarea
                ref={regardRef}
                value={userRegard}
                onChange={(e) => setUserRegard(e.target.value)}
                maxLength={100}
                placeholder={texts.form.regardPlaceholder}
                rows={3}
                className="shadow appearance-none rounded w-full py-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />

              <button
                ref={emojiButtonRef}
                type="button"
                aria-label="Add emoji"
                onClick={() => setShowEmojiPicker((s) => !s)}
                className="absolute right-2 bottom-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-full p-2"
              >
                <span aria-hidden>😊</span>
              </button>

              {/* Emoji picker */}
              {showEmojiPicker && (
                <div ref={pickerRef} className="absolute z-50 right-0 bottom-12">
                  <Picker
                    data={data}
                    onEmojiSelect={(emoji: any) => {
                      const native = emoji?.native || emoji?.colons || '';
                      // Insert at cursor position if possible
                      const textarea = regardRef.current;
                      if (textarea) {
                        const start = textarea.selectionStart || 0;
                        const end = textarea.selectionEnd || 0;
                        const newValue = userRegard.slice(0, start) + native + userRegard.slice(end);
                        setUserRegard(newValue);
                        // put caret after inserted emoji
                        requestAnimationFrame(() => {
                          textarea.focus();
                          const pos = start + native.length;
                          textarea.setSelectionRange(pos, pos);
                        });
                      } else {
                        setUserRegard((prev) => prev + native);
                      }
                      // close picker after selection
                      setShowEmojiPicker(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          {/* Submit button */}
          <div className="flex justify-center mt-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-80 text-white font-bold py-2 px-10 rounded-full min-w-36"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                  {texts.form.saving}
                </>
              ) : (
                texts.form.submit
              )}
            </button>
          </div>
          <p className="mt-4 text-center text-xs text-neutral-400">
            <span aria-hidden>🔒 </span>
            {texts.form.privacyNote}
          </p>
        </form>
      </div>
    </div>
  );
};

export default Form;
