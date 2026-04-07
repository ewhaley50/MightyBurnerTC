export async function handler () {
  const ICS_URL =
    "https://outlook.office365.com/owa/calendar/04fb85563d57432d800967845c72e4cb@mightyburnertc.com/99bd8d6872f448a987a8e70894b7dc4f5215431983378893200/calendar.ics";

  try {
    const response = await fetch(ICS_URL);
    const text = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: text,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Failed to load calendar feed." }),
    };
  }
}