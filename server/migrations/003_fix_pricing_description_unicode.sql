UPDATE pricing
SET description = CASE name
  WHEN 'start' THEN 'Премиум шаблоны, полный AI-анализ резюме, пополнение кредитов: 100'
  WHEN 'pro' THEN 'Все возможности Start, пополнение кредитов: 500'
  WHEN 'business' THEN 'Годовая подписка без лимитов и ограничений'
  ELSE description
END,
updated_at = NOW()
WHERE name IN ('start', 'pro', 'business');
