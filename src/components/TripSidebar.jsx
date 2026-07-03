function SidebarCard({ title, children }) {
  return (
    <section className="sidebar-card">
      <h3>{title}</h3>
      <div className="sidebar-card-content">{children}</div>
    </section>
  );
}

function SidebarRow({ label, value, strong = false }) {
  return (
    <div className={`sidebar-row ${strong ? "strong" : ""}`}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export default function TripSidebar({
  search,
  selectedStay,
  favorites,
  itineraryItems,
  stayTotal,
  activityTotal,
  total,
  remaining,
  money,
  user,
  isCollapsed,
  onToggleSidebar,
}) {
  return (
    <aside className={`left-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <button className="sidebar-toggle" type="button" onClick={onToggleSidebar}>
        {isCollapsed ? "›" : "‹"}
      </button>

      {isCollapsed ? (
        <div className="collapsed-sidebar-label">Voyagr</div>
      ) : (
        <>
          <div className="sidebar-header">
            <span className="sidebar-kicker">Voyagr board</span>
            <h2>Trip overview</h2>
          </div>

          <SidebarCard title="Account">
            <div className="sidebar-pill">
              <span>Status</span>
              <b>{user ? "Logged in" : "Guest mode"}</b>
            </div>
            {user && <p className="sidebar-note">{user.name}</p>}
          </SidebarCard>

          <SidebarCard title="Search">
            <SidebarRow label="Destination" value={search.destination} />
            <SidebarRow
              label="Dates"
              value={`${search.startDate || "Not selected"} → ${
                search.endDate || "Not selected"
              }`}
            />
            <SidebarRow label="Budget" value={money(Number(search.budget))} />
            <SidebarRow label="Range" value={`${search.radius} km`} />
          </SidebarCard>

          <SidebarCard title="Selected stay">
            {selectedStay ? (
              <>
                <SidebarRow label="Hotel" value={selectedStay.name} />
                <SidebarRow label="Area" value={selectedStay.address} />
                <SidebarRow
                  label="Night"
                  value={`${money(selectedStay.price)}/night`}
                />
              </>
            ) : (
              <p className="sidebar-empty">No stay selected yet.</p>
            )}
          </SidebarCard>

          <SidebarCard title="Favorites">
            {favorites.length ? (
              <div className="sidebar-chip-list">
                {favorites.slice(0, 5).map((item) => (
                  <span key={item.id}>♡ {item.name}</span>
                ))}
              </div>
            ) : (
              <p className="sidebar-empty">No favorites yet.</p>
            )}
          </SidebarCard>

          <SidebarCard title="Itinerary">
            {itineraryItems.length ? (
              <div className="sidebar-chip-list">
                {itineraryItems.slice(0, 5).map((item) => (
                  <span key={item.id}>✓ {item.name}</span>
                ))}
              </div>
            ) : (
              <p className="sidebar-empty">No places added yet.</p>
            )}
          </SidebarCard>

          <SidebarCard title="Trip cart">
            <SidebarRow label="Stay" value={money(stayTotal)} />
            <SidebarRow label="Places" value={money(activityTotal)} />
            <SidebarRow label="Total" value={money(total)} strong />
            <SidebarRow label="Left" value={money(remaining)} strong />
          </SidebarCard>
        </>
      )}
    </aside>
  );
}
