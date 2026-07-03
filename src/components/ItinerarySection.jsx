import { useState } from "react";
import { Wand2, Save, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { SectionTitle, Empty } from "./UI";

export default function ItinerarySection({
  itinerary,
  setItinerary,
  selectedStay,
  itineraryItems,
  setItineraryItems,
  loading,
  generateItinerary,
  saveTrip,
  saveItinerary,
}) {
  const [isEditing, setIsEditing] = useState(false);

  function moveItem(index, direction) {
    const nextItems = [...itineraryItems];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= nextItems.length) return;

    [nextItems[index], nextItems[targetIndex]] = [
      nextItems[targetIndex],
      nextItems[index],
    ];

    setItineraryItems(nextItems);
  }

  function removeItem(id) {
    setItineraryItems(itineraryItems.filter((item) => item.id !== id));
  }

  function updateItemName(id, value) {
    setItineraryItems(
      itineraryItems.map((item) =>
        item.id === id ? { ...item, name: value } : item
      )
    );
  }

  function saveEditedItinerary() {
    const lines = [
      `Voyagr itinerary`,
      ``,
      `Base stay: ${selectedStay?.name || "Selected stay"}`,
      ``,
    ];

    itineraryItems.forEach((item, index) => {
      lines.push(`- ${index + 1}. ${item.name}`);
    });

    setItinerary(lines.join("\n"));
    setIsEditing(false);
  }

  return (
    <section className="itinerary-section">
      <div className="panel itinerary-generator">
        <SectionTitle
          icon={<Wand2 />}
          title="Gemini AI itinerary generator"
          subtitle="Generate, edit and save your personalized travel plan."
        />

        <div className="itinerary-toolbar">
          <button
            className="primary itinerary-button"
            type="button"
            onClick={generateItinerary}
            disabled={loading || !selectedStay || itineraryItems.length === 0}
          >
            {loading ? "Generating..." : "Generate full itinerary"}
          </button>

          <button
            className="secondary-action"
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            disabled={itineraryItems.length === 0}
          >
            <Pencil size={16} />
            {isEditing ? "Close editor" : "Edit itinerary"}
          </button>

          <button
            className="secondary-action"
            type="button"
            onClick={saveItinerary}
            disabled={!itinerary}
          >
            <Save size={16} />
            Save itinerary
          </button>
        </div>

        {isEditing && (
          <div className="itinerary-editor">
            <h3>Edit itinerary events</h3>

            {itineraryItems.length ? (
              itineraryItems.map((item, index) => (
                <div className="editable-itinerary-row" key={item.id}>
                  <span className="event-number">{index + 1}</span>

                  <input
                    value={item.name}
                    onChange={(event) =>
                      updateItemName(item.id, event.target.value)
                    }
                  />

                  <button type="button" onClick={() => moveItem(index, -1)}>
                    <ArrowUp size={16} />
                  </button>

                  <button type="button" onClick={() => moveItem(index, 1)}>
                    <ArrowDown size={16} />
                  </button>

                  <button type="button" onClick={() => removeItem(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <Empty text="No itinerary events yet." />
            )}

            <button
              className="primary"
              type="button"
              onClick={saveEditedItinerary}
            >
              Apply itinerary changes
            </button>
          </div>
        )}

        {itinerary && (
          <div className="pretty-itinerary">
            {itinerary.split("\n").map((line, index) => {
              const cleanLine = line.trim();

              if (!cleanLine) return null;

              if (cleanLine.toLowerCase().startsWith("day")) {
                return <h3 key={index}>{cleanLine}</h3>;
              }

              if (cleanLine.startsWith("-")) {
                return <p key={index}>• {cleanLine.replace("-", "").trim()}</p>;
              }

              return <p key={index}>{cleanLine}</p>;
            })}
          </div>
        )}
      </div>
    </section>
  );
}