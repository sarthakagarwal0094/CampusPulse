
import { Users, Crown, UserRound, CalendarDays } from "lucide-react";
import { useEvents } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import { useCoordinatorProfiles } from "../context/CoordinatorProfileContext";
import "./CoordinatorTeams.css";

function CoordinatorTeams() {
  const { events } = useEvents();
  const { user } = useAuth();
  const { coordinatorProfiles: coordinators } = useCoordinatorProfiles();
  const currentCoordinatorId = user?.id;

  const myEvents = events.filter(
    (event) =>
      event.leadCoordinator === currentCoordinatorId ||
      event.coCoordinators?.includes(currentCoordinatorId)
  ).filter((event) => event.status !== "Archived");

  const getCoordinator = (id) =>
    coordinators.find((coordinator) => coordinator.id === id);

  return (
    <div className="coordinator-teams-page">
      <header className="teams-header">
        <div>
          <span className="teams-eyebrow">EVENT MANAGEMENT</span>
          <h1>Event Teams</h1>
          <p>View the organizing teams of your assigned events.</p>
        </div>

        <div className="teams-total">
          <Users size={20} />
          <span>{myEvents.length} Assigned Events</span>
        </div>
      </header>

      {myEvents.length === 0 ? (
        <div className="teams-empty">
          <Users size={45} />
          <h3>No assigned events</h3>
          <p>You will see your event teams here after being assigned to an event.</p>
        </div>
      ) : (
        <div className="teams-grid">
          {myEvents.map((event) => {
            const isLead = event.leadCoordinator === currentCoordinatorId;
            const lead = getCoordinator(event.leadCoordinator);

            return (
              <article className="team-event-card" key={event.id}>
                <div className="team-event-heading">
                  <div>
                    <span className="team-category">{event.category}</span>
                    <h2>{event.title}</h2>
                  </div>

                  <span className={`team-role ${isLead ? "lead-role" : "co-role"}`}>
                    {isLead ? "Lead Coordinator" : "Co-Coordinator"}
                  </span>
                </div>

                <div className="team-event-meta">
                  <span>
                    <CalendarDays size={15} />
                    {event.date}
                  </span>
                  <span>
                    <Users size={15} />
                    {(event.coCoordinators?.length || 0) + 1} Members
                  </span>
                </div>

                <div className="team-members">
                  <h3>Organizing Team</h3>

                  {lead && (
                    <div className="team-member lead-member">
                      <div className="team-avatar">
                        {lead.name.charAt(0)}
                      </div>
                      <div className="team-member-info">
                        <strong>{lead.name}</strong>
                        <span>Lead Coordinator</span>
                      </div>
                      <Crown className="team-member-icon" size={18} />
                    </div>
                  )}

                  {event.coCoordinators?.map((id) => {
                    const coordinator = getCoordinator(id);
                    if (!coordinator) return null;

                    return (
                      <div className="team-member" key={id}>
                        <div className="team-avatar">
                          {coordinator.name.charAt(0)}
                        </div>
                        <div className="team-member-info">
                          <strong>{coordinator.name}</strong>
                          <span>Co-Coordinator</span>
                        </div>
                        <UserRound className="team-member-icon" size={18} />
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CoordinatorTeams;
