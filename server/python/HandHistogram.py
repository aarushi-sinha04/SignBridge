import cv2
import numpy as np

def hist_masking(frame, hist):
    """
    Apply histogram-based masking to isolate the hand in the frame.
    
    Parameters:
    - frame: The input BGR frame from the webcam
    - hist: The pre-computed hand histogram loaded from file

    Returns:
    - mask: The mask image where the hand is highlighted
    - res: The masked output frame
    """
    # Convert frame to HSV for histogram-based segmentation
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    # Apply backprojection using the histogram
    dst = cv2.calcBackProject([hsv], [0, 1], hist, [0, 180, 0, 256], 1)

    # Filtering the backprojection result to clean up the mask
    disc = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (10, 10))
    cv2.filter2D(dst, -1, disc, dst)

    # Threshold and binary conversion
    _, thresh = cv2.threshold(dst, 50, 255, cv2.THRESH_BINARY)

    # Morphological operations to remove noise
    thresh = cv2.erode(thresh, None, iterations=2)
    thresh = cv2.dilate(thresh, None, iterations=2)

    # Apply mask on original frame
    res = cv2.bitwise_and(frame, frame, mask=thresh)

    return thresh, res
