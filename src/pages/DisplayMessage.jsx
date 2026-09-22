import RobotImage from "../assets/robot.png";
import UserImage from "../assets/user.png";

export function DisplayMessage({ message, sender }) {
  return (
    <div
      className={
        sender === "robot" ? "robot-display-message" : "user-display-message"
      }
    >
      {sender === "robot" && (
        <img src={RobotImage} width="30" height="30" className="img-display" />
      )}
      <div className="message-display">{message}</div>
      {sender === "user" && (
        <img src={UserImage} width="30" height="30" className="img-display" />
      )}
    </div>
  );
}
