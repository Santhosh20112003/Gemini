export const ParseDate = (date) => {
  const event = new Date(date);
  const currentDate = new Date();

  // Calculate yesterday's date
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);

  // Check if the event date is today
  const isToday = event.getDate() === currentDate.getDate() &&
                  event.getMonth() === currentDate.getMonth() &&
                  event.getFullYear() === currentDate.getFullYear();

  // Check if the event date is yesterday
  const isYesterday = event.getDate() === yesterday.getDate() &&
                    event.getMonth() === yesterday.getMonth() &&
                    event.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    // Display time if today
    const hours = event.getHours();
    const minutes = event.getMinutes();
    let period = "AM";

    if (hours >= 12) {
      period = "PM";
    }

    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${displayHours}:${displayMinutes} ${period}`;
  } else if (isYesterday) {
    // Display time if yesterday
    const hours = event.getHours();
    const minutes = event.getMinutes();
    let period = "AM";

    if (hours >= 12) {
      period = "PM";
    }

    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `yesterday  ,${displayHours}:${displayMinutes} ${period} `;
  } else {
    // Display the other format if not today or yesterday
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthIndex = event.getMonth();
    const month = months[monthIndex];
    const hours = event.getHours();
    const minutes = event.getMinutes();
    let period = "AM";

    if (hours >= 12) {
      period = "PM";
    }

    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

    const day = event.getDate();
    const year = event.getFullYear();

    return `${displayHours}:${displayMinutes} ${period} , ${month} ${day}`;
  }
};