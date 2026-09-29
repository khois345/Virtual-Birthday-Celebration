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
    { icon: "fa-pen", text: texts.form.stepCreate },
    { icon: "fa-link", text: texts.form.stepShare },
    { icon: "fa-cake-candles", text: texts.form.stepCelebrate },
  ];

  return (
    <div className="flex flex-col items-center px-4 pt-10 sm:pt-16">
      {/* Intro */}
      <section className="w-full max-w-2xl text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">{texts.form.heroTitle}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-neutral-300 sm:text-lg">{texts.form.heroSubtitle}</p>

        <h2 className="sr-only">{texts.form.howItWorks}</h2>
        <ol className="mt-6 grid gap-2 sm:grid-cols-3 sm:gap-3 text-left sm:text-center">
          {steps.map((step, index) => (
            <li
              key={index}
              className="flex items-center gap-3 rounded-lg bg-neutral-700/60 border border-neutral-600 px-3 py-2.5 sm:flex-col sm:gap-2 sm:px-4 sm:py-4"
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-800/30 text-sm text-orange-300">
                <i className={`fa-solid ${step.icon}`} aria-hidden="true" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-800 text-[10px] font-bold text-white">
                  {index + 1}
                </span>
              </span>
              <span className="text-xs sm:text-[13px] leading-snug text-neutral-200">{step.text}</span>
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
                className="flex h-9 items-center justify-center bg-gray-600 hover:bg-gray-500 border rounded-l-lg px-3 focus:outline-none"
              >
                <i className="fa-solid fa-minus text-xs text-white" aria-hidden="true" />
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
                className="flex h-9 items-center justify-center bg-gray-600 hover:bg-gray-500 border rounded-e-lg px-3 outline-none"
              >
                <i className="fa-solid fa-plus text-xs text-white" aria-hidden="true" />
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
                className="shadow appearance-none rounded w-full py-2 pl-3 pr-12 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />

              <button
                ref={emojiButtonRef}
                type="button"
                aria-label="Add emoji"
                onClick={() => setShowEmojiPicker((s) => !s)}
                className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center bg-neutral-600 hover:bg-neutral-500 text-white rounded-full"
              >
                <i className="fa-regular fa-face-smile" aria-hidden="true" />
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
            <i className="fa-solid fa-lock mr-1.5" aria-hidden="true" />
            {texts.form.privacyNote}
          </p>
        </form>
      </div>
    </div>
  );
};

export default Form;
