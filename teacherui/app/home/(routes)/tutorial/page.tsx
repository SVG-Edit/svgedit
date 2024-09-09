"use client";

import React, { useState, useRef } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FiUpload, FiTrash, FiMonitor } from "react-icons/fi";
import "./TutorialPage.css";
import { useRouter } from "next/navigation"; // For navigation

interface DeckData {
  title: string;
  images: { src: string; notes: string }[];
}

const TutorialPage: React.FC = () => {
  const [decks, setDecks] = useState<DeckData[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const deckInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter(); // Initialize router

  // Function to handle deck file upload
  const handleDeckUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((selectedFile) => {
        const zip = new JSZip();
        zip.loadAsync(selectedFile).then((contents) => {
          const newImages: { src: string; notes: string }[] = [];
          const promises = Object.keys(contents.files).map((filename) => {
            return contents.files[filename].async("base64").then((fileData) => {
              if (filename.endsWith(".png")) {
                const base64Data = `data:image/png;base64,${fileData}`;
                const imageIndex =
                  parseInt(filename.split("-")[1].split(".")[0], 10) - 1;
                if (newImages[imageIndex]) {
                  newImages[imageIndex].src = base64Data;
                } else {
                  newImages[imageIndex] = { src: base64Data, notes: "" };
                }
              } else if (filename.endsWith("-notes.txt")) {
                const imageIndex =
                  parseInt(filename.split("-")[1].split(".")[0], 10) - 1;
                const decodedNotes = decodeNotes(fileData);
                if (newImages[imageIndex]) {
                  newImages[imageIndex].notes = decodedNotes;
                } else {
                  newImages[imageIndex] = { src: "", notes: decodedNotes };
                }
              }
            });
          });
          Promise.all(promises).then(() => {
            const newDeck: DeckData = {
              title: selectedFile.name.replace(".zip", ""),
              images: newImages,
            };
            setDecks((prevDecks) => [...prevDecks, newDeck]);
          });
        });
      });
    }
  };

  // Function to decode base64 notes
  const decodeNotes = (base64: string): string => {
    const decodedArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const decoder = new TextDecoder();
    return decoder.decode(decodedArray);
  };

  // Function to handle deck deletion
  const handleDeleteDeck = (index: number) => {
    setDecks((prevDecks) => prevDecks.filter((_, i) => i !== index));
  };

  // Function to handle entering presenter mode
  const handlePresenterMode = (deck: DeckData) => {
    // Store the selected deck in local storage
    localStorage.setItem("selectedDeck", JSON.stringify(deck));
    // Navigate to the CanvasBox page
    router.push("/home/search?presenterMode=true");
  };

  // Function to display popup message
  const handleSendToMonarch = () => {
    showPopupMessage("Image sent to the Monarch successfully");
  };

  // Function to display a message in a popup
  const showPopupMessage = (message: string) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <span>
            Get started by uploading a previously created course deck or
            navigate to the <b>Create</b> section to get started or edit an
            existing one!
          </span>
          Find out more about the Monarch and this UI tool in the FAQ section
          below.
        </div>
      </div>
      <div className="flex items-center gap-x-2 mt-8">
        <Button onClick={() => deckInputRef.current?.click()}>
          Upload Deck <FiUpload style={{ marginLeft: "5px" }} />
        </Button>
        <input
          type="file"
          accept=".zip"
          multiple
          id="deck-upload"
          style={{ display: "none" }}
          onChange={handleDeckUpload}
          ref={deckInputRef}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        {decks.map((deck, index) => (
          <div key={index} className="p-4 border border-gray-300 rounded">
            <h2 className="text-xl text-slate-800">{deck.title}</h2>
            {deck.images.length > 0 && (
              <img
                src={deck.images[0].src}
                alt={`Deck ${index + 1} Image 1`}
                className="mt-2 w-full h-32 object-cover"
              />
            )}
            <p>{deck.images.length} images</p>
            <div className="flex items-center gap-x-2 mt-2">
              <Button
                onClick={() => handleDeleteDeck(index)}
                className="text-sm text-red-500"
              >
                Delete <FiTrash style={{ marginLeft: "5px" }} />
              </Button>
              <Button
                onClick={() => handlePresenterMode(deck)}
                className="text-sm text-blue-500"
              >
                Presenter Mode <FiMonitor style={{ marginLeft: "5px" }} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showPopup && <div className="popup">{popupMessage}</div>}

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is the Monarch?</AccordionTrigger>
            <AccordionContent>
              The Monarch is an innovative device designed to aid blind and
              visually impaired (BLV) students in their educational journey. It
              combines tactile graphics and Braille text, enabling students to
              access and interact with various types of content.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How does the Monarch work?</AccordionTrigger>
            <AccordionContent>
              The Monarch uses a combination of tactile displays and electronic
              Braille to present information. It can display raised images and
              Braille text simultaneously, allowing BLV students to read and
              understand complex diagrams, charts, and other visual content.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              Who can benefit from using the Monarch?
            </AccordionTrigger>
            <AccordionContent>
              The Monarch is primarily designed for blind and visually impaired
              students. However, it can also be beneficial for educators,
              parents, and other professionals who work with BLV individuals by
              providing an effective tool for teaching and communication.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>
              What types of content can be displayed on the Monarch?
            </AccordionTrigger>
            <AccordionContent>
              The Monarch can display a wide range of content, including
              textbooks, diagrams, charts, graphs, and other educational
              materials. It supports various file formats and can convert
              digital content into tactile graphics and Braille.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>
              How can I upload content to the Monarch?
            </AccordionTrigger>
            <AccordionContent>
              Content can be uploaded to the Monarch via a USB connection,
              Bluetooth, or Wi-Fi. Users can transfer files from a computer or
              other devices directly to the Monarch.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionTrigger>Is the Monarch portable?</AccordionTrigger>
            <AccordionContent>
              Yes, the Monarch is designed to be portable. It is lightweight and
              has a battery that provides several hours of usage, making it
              convenient for students to carry it between classes and use it
              throughout the day.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-7">
            <AccordionTrigger>
              Can the Monarch be used for standardized testing?
            </AccordionTrigger>
            <AccordionContent>
              Yes, the Monarch can be used for standardized testing. It supports
              secure and accessible test delivery, ensuring that BLV students
              can take exams independently and confidently.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-8">
            <AccordionTrigger>
              How does the Monarch help in learning STEM subjects?
            </AccordionTrigger>
            <AccordionContent>
              The Monarch excels in displaying tactile graphics, which is
              crucial for understanding STEM (Science, Technology, Engineering,
              and Mathematics) subjects. It can show complex diagrams, graphs,
              and equations in a tactile format, making it easier for BLV
              students to grasp challenging concepts.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9">
            <AccordionTrigger>
              How does the UI tool designed by us enhance the use of the
              Monarch?
            </AccordionTrigger>
            <AccordionContent>
              Our newly designed UI tool for teachers is specifically crafted to
              enhance the educational experience of BLV students using the
              Monarch. This tool allows teachers to:
              <ul>
                <li>
                  <strong>Easily Upload and Organize Content:</strong> Teachers
                  can upload various educational materials, including images or
                  decks and organize them into courses or lessons.
                </li>
                <li>
                  <strong>Create Interactive Lessons:</strong> Teachers can
                  create interactive lessons that utilize the Monarch's tactile
                  and Braille capabilities, making learning more engaging for
                  students.
                </li>
              </ul>
              By integrating these features, our UI tool makes it easier for
              teachers to utilize the Monarch effectively, ensuring that BLV
              students receive a comprehensive and engaging education tailored
              to their needs.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default TutorialPage;
