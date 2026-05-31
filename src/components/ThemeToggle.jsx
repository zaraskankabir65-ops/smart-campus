import React from 'react'
import { Sun, Moon } from 'lucide-react'

function ThemeToggle({ isDarkMode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-indigo-600 dark:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun className="w-6 h-6 text-white animate-pulse" />
      ) : (
        <Moon className="w-6 h-6 text-white animate-pulse" />
      )}
    </button>
  )
}

export default ThemeToggle
