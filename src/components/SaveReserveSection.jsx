
import { CheckCircle2, Wallet } from "lucide-react";
import { SectionTitle } from "./UI";

export default function SaveReserveSection({
  saveTrip,
  reserve,
  saveStatus,
  selectedStay,
  booking,
}) {
  return (
    <section className="dashboard">
      <div className="panel final-actions">
        <SectionTitle
          icon={<Wallet />}
          title="Save or reserve"
          subtitle="Keep this plan in your Voyagr account or create a booking draft."
        />

        <div className="final-action-grid">
          <button className="primary" onClick={saveTrip} type="button">
            Save trip
          </button>

          <button
            className="primary"
            onClick={reserve}
            disabled={!selectedStay}
            type="button"
          >
            Reserve selected plan
          </button>
        </div>

        {saveStatus && <div className="success">{saveStatus}</div>}

        {booking && (
          <div className="success">
            <CheckCircle2 /> Booking draft created: <b>{booking.code}</b>
          </div>
        )}
      </div>
    </section>
  );
}

