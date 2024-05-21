export const ParseDate = (date) => {
  const event = new Date(date);
  const currentDate = new Date();

  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);

  const isToday = event.getDate() === currentDate.getDate() &&
                  event.getMonth() === currentDate.getMonth() &&
                  event.getFullYear() === currentDate.getFullYear();

  const isYesterday = event.getDate() === yesterday.getDate() &&
                    event.getMonth() === yesterday.getMonth() &&
                    event.getFullYear() === yesterday.getFullYear();

  if (isToday) {
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
    const hours = event.getHours();
    const minutes = event.getMinutes();
    let period = "AM";

    if (hours >= 12) {
      period = "PM";
    }

    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${displayHours}:${displayMinutes} ${period} , yesterday`;
  } else {
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