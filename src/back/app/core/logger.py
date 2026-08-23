import logging
import os
import sys

# ANSI colors for log levels
LEVEL_COLORS = {
    "CRITICAL": "\033[41m",  # Red background
    "ERROR": "\033[41m",  # Red background
    "WARNING": "\033[43m",  # Yellow background
    "INFO": "\033[42m",  # Green background
    "DEBUG": "\033[46m",  # Cyan background
    "NOTSET": "\033[47m",  # White background
}
RESET_COLOR = "\033[0m"


class CustomFormatter(logging.Formatter):
    BLUE = "\033[36m"  # cyan color for timestamp and message
    RESET = "\033[0m"

    def format(self, record):
        levelname = record.levelname
        level_width = 8
        # colored log level (background color)
        colored_level = f"{LEVEL_COLORS.get(levelname, '')}{levelname.center(level_width)}{RESET_COLOR}"

        # timestamp in blue
        timestamp = self.formatTime(record, "%d-%m-%Y %H:%M:%S")
        timestamp_colored = f"{self.BLUE}{timestamp}{self.RESET}"

        # context if present
        context = getattr(record, "context", "")
        context_str = f"[{context}] - " if context else ""

        # stack info if present
        stack = getattr(record, "stack", "")
        stack_str = f"[{stack}] - " if stack else ""

        # log message in blue
        message = f"{self.BLUE}{record.getMessage()}{self.RESET}"

        # construct final log line
        log_msg = f"{timestamp_colored} - [{colored_level}] - {context_str}{stack_str}{message}"
        return log_msg


def get_logger(name: str = "app") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)

        # console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(
            logging.DEBUG
            if os.getenv("ENV", "development") != "production"
            else logging.INFO
        )

        if os.getenv("ENV", "development") == "production":
            # production: write JSON logs to file
            file_handler = logging.FileHandler("error.log")
            file_handler.setLevel(logging.ERROR)
            console_handler.setFormatter(
                logging.Formatter(
                    '{"time": "%(asctime)s", "level": "%(levelname)s", "name": "%(name)s", "message": "%(message)s"}'
                )
            )
            logger.addHandler(file_handler)
        else:
            # development: colored console output
            console_handler.setFormatter(CustomFormatter())

        logger.addHandler(console_handler)
    return logger


# global logger instance
logger = get_logger()
