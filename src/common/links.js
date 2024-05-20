export const ParseDate = (date) => {
  const event = new Date(date);
  const currentDate = new Date();

  const timeDiffInMilliseconds = currentDate.getTime() - event.getTime();
  const timeDiffInHours = Math.floor(timeDiffInMilliseconds / (1000 * 60 * 60));

  if (timeDiffInHours < 24) {
    const hours = event.getHours();
    const minutes = event.getMinutes();
    let period = "AM";

    if (hours >= 12) {
      period = "PM";
    }

    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${displayHours}:${displayMinutes} ${period}`;
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

    const day = event.getDate();
    const year = event.getFullYear();

    return `${month} ${day}, ${year}`;
  }
};