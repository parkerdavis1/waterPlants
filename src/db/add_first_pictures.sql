-- This SQL script adds the "profile" picture to the first watering event for each plant
UPDATE watering_event
SET image_url = (
  SELECT p1.image_url
  FROM plant p1
  WHERE p1.id = watering_event.plant_id
    AND p1.image_url IS NOT NULL
)
WHERE id IN (
  SELECT we.id
  FROM watering_event we
  JOIN (
    SELECT plant_id, MIN(timestamp) AS min_timestamp
    FROM watering_event
    GROUP BY plant_id
  ) first_we
    ON we.plant_id = first_we.plant_id
   AND we.timestamp = first_we.min_timestamp
)
AND (
  SELECT p2.image_url
  FROM plant p2
  WHERE p2.id = watering_event.plant_id
) IS NOT NULL;