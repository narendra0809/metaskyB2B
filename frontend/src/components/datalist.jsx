import { useState } from 'react'

const SearchableSelect = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false) // Track if dropdown is open
  const [filter, setFilter] = useState('') // Filtered value (user's input)
  const [selectedOption, setSelectedOption] = useState('') // Selected value

  // Filter options based on the filter text
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(filter.toLowerCase())
  )

  const handleFilterChange = (e) => {
    setFilter(e.target.value) // Update the filter value as the user types
  }

  const handleOptionClick = (option) => {
    setSelectedOption(option) // Set the selected option
    setIsOpen(false) // Close the dropdown after selection
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen) // Toggle the visibility of the dropdown
  }

  return (
    <div className="dropdown-container position-relative">
      <div
        className="dropdown-toggle btn btn-outline-secondary d-flex align-items-center justify-content-between"
        onClick={toggleDropdown}
        aria-expanded={isOpen ? 'true' : 'false'}
      >
        <input
          type="text"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Search..."
          className="form-control border-0"
        />
        <span className="caret"></span>
      </div>

      {isOpen && (
        <div
          className="dropdown-menu w-100 show"
          aria-labelledby="dropdownMenuButton"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                key={index}
                className="dropdown-item"
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            ))
          ) : (
            <span className="dropdown-item disabled">No options available</span>
          )}
        </div>
      )}

      {selectedOption && (
        <div className="mt-2">
          <strong>Selected: </strong>
          {selectedOption}
        </div>
      )}
    </div>
  )
}

export default SearchableSelect
