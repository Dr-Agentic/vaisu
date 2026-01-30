Create an executive summary of the document.
Return ONLY valid JSON matching this exact format (do not use markdown code blocks):
{
  "headline": "One compelling sentence capturing the essence",
  "keyIdeas": [
    "Most important takeaway 1",
    "Most important takeaway 2",
    "Most important takeaway 3"
  ],
  "kpis": [
    {
      "id": "kpi-1",
      "label": "Metric Name",
      "value": 100,
      "unit": "%",
      "trend": "up",
      "confidence": 0.9
    }
  ],
  "risks": [
    "Potential challenge or concern 1",
    "Potential challenge or concern 2"
  ],
  "opportunities": [
    "Potential benefit or advantage 1",
    "Potential benefit or advantage 2"
  ],
  "callToAction": "Specific action to take next"
}

Ensure "value" in KPIs is a number (not a string). Extract 3-5 items for lists.
