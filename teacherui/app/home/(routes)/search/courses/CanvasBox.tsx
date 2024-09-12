"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import "./CanvasBox.css";
import { Button } from "@/components/ui/button";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiUpload,
  FiTrash,
  FiEdit,
  FiMonitor,
  FiX,
} from "react-icons/fi";
import useUndo from "./useUndoRedo";
import { useSearchParams } from "next/navigation"; // For query handling

interface ImageData {
  src: string;
  notes: string;
}

const CanvasBox: React.FC = () => {
  const { state: images, setDocument: setImages } = useUndo<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [presenterMode, setPresenterMode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [selectedLayer, setSelectedLayer] = useState("Default Layer");
  const [presenterSelectedLayer, setPresenterSelectedLayer] =
    useState("Default Layer");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deckInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);
  const presenterNoteInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams(); // Initialize search params

  useEffect(() => {
    const storedImages = localStorage.getItem("deck-images");
    const storedTitle = localStorage.getItem("deck-title");
    if (storedImages) {
      setImages(JSON.parse(storedImages));
    }
    if (storedTitle) {
      setTitle(storedTitle);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handlePrevImage();
      } else if (event.key === "ArrowRight") {
        handleNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("deck-images", JSON.stringify(images));
  }, [images]);

  useEffect(() => {
    localStorage.setItem("deck-title", title);
  }, [title]);

  useEffect(() => {
    const params = searchParams;
    if (params.get("presenterMode")) {
      const deck = JSON.parse(localStorage.getItem("selectedDeck") as string);
      setTitle(deck.title);
      setImages(deck.images);
      setPresenterMode(true);
    }
  }, [searchParams]);

  const encodeNotes = (notes: string): string => {
    const encoder = new TextEncoder();
    const encodedArray = encoder.encode(notes);
    return btoa(String.fromCharCode(...Array.from(encodedArray)));
  };

  const decodeNotes = (base64: string): string => {
    const decodedArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const decoder = new TextDecoder();
    return decoder.decode(decodedArray);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: ImageData[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          newImages.push({ src: result, notes: "" });
          if (newImages.length === files.length) {
            setImages((prevImages: ImageData[]) => {
              const updatedImages = [...prevImages, ...newImages];
              setCurrentImageIndex(updatedImages.length - 1);
              return updatedImages;
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDeckUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const zip = new JSZip();
      zip.loadAsync(selectedFile).then((contents) => {
        const newImages: ImageData[] = [];
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
          setImages(newImages);
          setCurrentImageIndex(0);
        });
      });
    }
  };

  const handleDownloadDeck = () => {
    if (!title) {
      showPopupMessage("Please add deck title");
      return;
    }
    if (images.length === 0) {
      showPopupMessage("Please add images");
      return;
    }
    if (images.length > 0) {
      const zip = new JSZip();
      images.forEach((image, index) => {
        zip.file(`image-${index + 1}.png`, image.src.split(",")[1], {
          base64: true,
        });
        zip.file(`image-${index + 1}-notes.txt`, encodeNotes(image.notes));
      });
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, title ? `${title}.zip` : "image-deck.zip");
      });
    }
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? prevIndex : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? prevIndex : prevIndex - 1
    );
  };

  const handleDeleteImage = () => {
    setImages((prevImages: ImageData[]) => {
      const newImages = prevImages.filter(
        (_, index) => index !== currentImageIndex
      );
      if (currentImageIndex >= newImages.length) {
        setCurrentImageIndex(newImages.length - 1);
      }
      return newImages;
    });
  };

  const handleSendToMonarch = () => {
    // Simulate sending the image to Monarch
    showPopupMessage("Image sent to the Monarch successfully");
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return; // Check if destination is valid
    const reorderedImages = Array.from(images);
    const [removed] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, removed);
    setImages(reorderedImages);
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex === result.source.index) {
        return result.destination!.index;
      } else if (
        prevIndex > result.source.index &&
        prevIndex <= result.destination!.index
      ) {
        return prevIndex - 1;
      } else if (
        prevIndex < result.source.index &&
        prevIndex >= result.destination!.index
      ) {
        return prevIndex + 1;
      }
      return prevIndex;
    });
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      setIsEditingTitle(false);
    }
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedImages = images.map((img, index) =>
      index === currentImageIndex ? { ...img, notes: event.target.value } : img
    );
    setImages(updatedImages);
  };

  const handlePresenterNoteChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedImages = images.map((img, index) =>
      index === currentImageIndex ? { ...img, notes: event.target.value } : img
    );
    setImages(updatedImages);
  };

  const handleNoteBlur = () => {
    if (noteInputRef.current) {
      noteInputRef.current.blur();
    }
  };

  const handlePresenterNoteBlur = () => {
    if (presenterNoteInputRef.current) {
      presenterNoteInputRef.current.blur();
    }
  };

  const handleNoteKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleNoteBlur();
    }
  };

  const handlePresenterNoteKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handlePresenterNoteBlur();
    }
  };

  const openPresenterMode = () => {
    if (!title) {
      showPopupMessage("Please add deck title");
      return;
    }
    if (images.length === 0) {
      showPopupMessage("Please add images");
      return;
    }
    setPresenterMode(true);
  };

  const closePresenterMode = () => {
    setPresenterMode(false);
  };

  const showPopupMessage = (message: string) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  const handleLayerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLayer(event.target.value);
  };

  const handlePresenterLayerChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPresenterSelectedLayer(event.target.value);
  };

  return (
    <div className="canvas-box">
      <div className="canvas-header">
        <div className="title-input-container">
          <input
            ref={titleInputRef}
            className={`title-input ${!title ? "placeholder-active" : ""}`}
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyPress={handleTitleKeyPress}
            placeholder="Please add deck title"
            autoFocus={isEditingTitle}
          />
          <FiEdit
            className="edit-icon"
            onClick={() => {
              setIsEditingTitle(true);
              setTimeout(() => titleInputRef.current?.focus(), 0);
            }}
          />
        </div>
        <div className="header-buttons">
          <Button onClick={handleDownloadDeck} className="download-button">
            Download Deck <FiDownload style={{ marginLeft: "5px" }} />
          </Button>
          <Button onClick={openPresenterMode} className="presenter-button">
            Presenter Mode <FiMonitor style={{ marginLeft: "5px" }} />
          </Button>
        </div>
        <div className="layer-select-container">
          <select
            value={selectedLayer}
            onChange={handleLayerChange}
            className="layer-select"
          >
            <option>Default Layer</option>
            <option>Layer 1</option>
            <option>Layer 2</option>
            <option>Layer 3</option>
            <option>Layer 4</option>
            <option>Layer 5</option>
          </select>
        </div>
      </div>
      <button className="round-button edit-title-button">
        <FiEdit size={18} />
      </button>
      <div className="canvas-content">
        {images.length > 0 && images[currentImageIndex] ? (
          <>
            <img
              src={images[currentImageIndex].src}
              alt={`Image ${currentImageIndex + 1}`}
              className="uploaded-image"
            />
            <button
              className="round-button left-button"
              onClick={handlePrevImage}
              aria-label="Previous Image"
              disabled={currentImageIndex === 0}
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              className="round-button right-button"
              onClick={handleNextImage}
              aria-label="Next Image"
              disabled={currentImageIndex === images.length - 1}
            >
              <FiChevronRight size={24} />
            </button>
          </>
        ) : (
          <p>No images uploaded.</p>
        )}
      </div>
      <div className="canvas-footer">
        <input
          type="file"
          accept="image/*"
          multiple
          id="image-upload"
          style={{ display: "none" }}
          onChange={handleImageUpload}
          ref={fileInputRef}
        />
        <input
          type="file"
          accept=".zip"
          id="deck-upload"
          style={{ display: "none" }}
          onChange={handleDeckUpload}
          ref={deckInputRef}
        />
        <Button onClick={() => fileInputRef.current?.click()}>
          {images.length > 0 ? "Upload Another Image" : "Upload Image"}{" "}
          <FiUpload style={{ marginLeft: "5px" }} />
        </Button>
        <Button onClick={() => deckInputRef.current?.click()}>
          Upload Deck <FiUpload style={{ marginLeft: "5px" }} />
        </Button>
        {images.length > 0 && (
          <>
            <Button onClick={handleDeleteImage}>
              Delete Image <FiTrash style={{ marginLeft: "5px" }} />
            </Button>
            <Button
              onClick={handleSendToMonarch}
              className="send-to-monarch-button"
            >
              Send to Monarch
            </Button>
          </>
        )}
      </div>
      {images.length > 0 && images[currentImageIndex] && (
        <>
          <input
            ref={noteInputRef}
            className="note-input"
            type="text"
            value={images[currentImageIndex]?.notes || ""}
            onChange={handleNoteChange}
            onBlur={handleNoteBlur}
            onKeyPress={handleNoteKeyPress}
            placeholder="Add notes for this image"
          />
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress"
                style={{
                  width: `${((currentImageIndex + 1) / images.length) * 100}%`,
                }}
              ></div>
            </div>
            <div className="slide-count">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="thumbnails" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="thumbnails-container"
            >
              {images.map((image: ImageData, index: number) => (
                <Draggable
                  key={`image-${index}`}
                  draggableId={`image-${index}`}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`thumbnail-box ${
                        index === currentImageIndex ? "active-thumbnail" : ""
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img
                        src={image.src}
                        alt={`Thumbnail ${index + 1}`}
                        className="thumbnail-image"
                      />
                      <div className="thumbnail-number">#{index + 1}</div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {presenterMode && (
        <div className="presenter-mode">
          <div className="presenter-content">
            <button className="close-button" onClick={closePresenterMode}>
              <FiX size={24} />
            </button>
            <div className="presenter-image-container">
              <button
                className="round-button presenter-left-button"
                onClick={handlePrevImage}
                aria-label="Previous Image"
                disabled={currentImageIndex === 0}
              >
                <FiChevronLeft size={24} />
              </button>
              <img
                src={images[currentImageIndex].src}
                alt={`Presenter Image ${currentImageIndex + 1}`}
                className="presenter-image"
              />
              <button
                className="round-button presenter-right-button"
                onClick={handleNextImage}
                aria-label="Next Image"
                disabled={currentImageIndex === images.length - 1}
              >
                <FiChevronRight size={24} />
              </button>
            </div>
            <div className="presenter-notes-container">
              <input
                ref={presenterNoteInputRef}
                className="presenter-note-input"
                type="text"
                value={images[currentImageIndex]?.notes || ""}
                onChange={handlePresenterNoteChange}
                onBlur={handlePresenterNoteBlur}
                onKeyPress={handlePresenterNoteKeyPress}
                placeholder="Add notes for this image"
              />
            </div>
            <div className="progress-container presenter-progress-container">
              <div className="progress-bar presenter-progress-bar">
                <div
                  className="progress"
                  style={{
                    width: `${
                      ((currentImageIndex + 1) / images.length) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="slide-count presenter-slide-count">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
            <div className="presenter-footer">
              <Button
                onClick={handleSendToMonarch}
                className="send-to-monarch-button"
              >
                Send to Monarch
              </Button>
              <div className="layer-select-container presenter-layer-select">
                <select
                  value={presenterSelectedLayer}
                  onChange={handlePresenterLayerChange}
                  className="layer-select"
                >
                  <option>Default Layer</option>
                  <option>Layer 1</option>
                  <option>Layer 2</option>
                  <option>Layer 3</option>
                  <option>Layer 4</option>
                  <option>Layer 5</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPopup && <div className="popup">{popupMessage}</div>}
    </div>
  );
};

export { CanvasBox };
export default CanvasBox;
