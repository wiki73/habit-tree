export const ANIMATIONS = [
  { id: 'PUSHUPS', label: 'Отжимается', icon: '🏃‍♂️', tailwindClass: 'animate-bounce [animation-duration:0.8s]' },
  { id: 'PULLUPS', label: 'Подтягивается', icon: '🧗‍♂️', tailwindClass: 'animate-bounce [animation-duration:1.2s]' },
  { id: 'SHOWER', label: 'Закаляется', icon: '🥶', tailwindClass: 'animate-bounce [animation-duration:0.8s]' },
  { id: 'SALAD', label: 'Ест салат', icon: '🥗', tailwindClass: 'animate-spin [animation-duration:4s]' },
  { id: 'DANCE', label: 'Танцует', icon: '🕺', tailwindClass: 'animate-bounce' },
  { id: 'MEDITATE', label: 'Медитирует', icon: '🧘‍♂️', tailwindClass: 'animate-bounce [animation-duration:0.8s]'},
]

// Функция для выбора случайного человечка
export function getRandomAnimationId() {
  const randomIndex = Math.floor(Math.random() * ANIMATIONS.length)
  return ANIMATIONS[randomIndex].id
}
