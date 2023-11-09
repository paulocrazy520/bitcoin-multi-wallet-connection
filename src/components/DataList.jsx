import React, { useEffect, useRef, useState } from "react";
import searchIcon from "../assets/icons/search.svg";
import { useAuthState } from "../context/AuthContext";
import CancelIcon from "../assets/icons/CancelIcon";

function DataList({
    options = [],
    placeholder = "Search",
    handleBlur,
    handleOptionClick,
    typeRadio = false,
}) {
    const [filteredOptions, setFilteredOptions] = useState(options);
    const { authState } = useAuthState();
    const inputRef = useRef();

    const handleSearch = (e) => {
        const value = e.target.value.trim();

        if (value) {
            setFilteredOptions(
                options.filter((option) => option.label.toLowerCase().includes(value.toLowerCase()))
            );
        } else {
            setFilteredOptions(options);
        }
    };

    useEffect(() => {
        inputRef.current.focus();
    }, []);

    return (
        <section className="datalist__container" onBlur={handleBlur}>
            <div className="datalist__input">
                <img src={searchIcon} alt="search" />
                <input
                    type="text"
                    placeholder={placeholder}
                    onChange={handleSearch}
                    ref={inputRef}
                />

                {typeRadio ? (
                    <CancelIcon />
                ) : (
                    <svg
                        className="fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                    >
                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                    </svg>
                )}
            </div>

            <div className="datalist__options">
                {filteredOptions.map((option) => (
                    <div
                        className={`datalist__option ${
                            typeRadio && option.value === authState.network ? "active" : ""
                        }`}
                        key={option.value}
                        onClick={() => {
                            handleOptionClick(option);
                        }}
                    >
                        <img src={option.icon} alt={option.label} />
                        <p>{option.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default DataList;
