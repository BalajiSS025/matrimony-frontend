import React from 'react';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const PhotoModal = ({ photos = [], startIndex = 0, isOpen, onClose }) => {
    if (!isOpen || photos.length === 0) return null;

    const slides = photos.map(src => ({ src }));

    return (
        <Lightbox
            open={isOpen}
            close={onClose}
            index={startIndex}
            slides={slides}
            plugins={[Zoom, Thumbnails]}
            animation={{ swipe: 250 }}
            carousel={{ finite: false }}
            styles={{
                container: { backgroundColor: "rgba(0, 0, 0, 0.9)" }
            }}
            thumbnails={{
                position: "bottom",
                width: 120,
                height: 80,
                border: 2,
                borderRadius: 8,
                padding: 4,
                gap: 16,
            }}
            zoom={{
                maxZoomPixelRatio: 5,
                zoomInMultiplier: 2,
                doubleTapDelay: 300,
                doubleClickDelay: 300,
                doubleClickMaxStops: 2,
                keyboardMoveDistance: 50,
                wheelZoomDistanceFactor: 100,
                pinchZoomDistanceFactor: 100,
                scrollToZoom: false,
            }}
        />
    );
};

export default PhotoModal;
