import React, { useState } from "react";
import ReactAudioPlayer from "react-audio-player";

const AudioPlayer = ({ src }) => {

  return (
    <>
      {src && (
        <div>
            <ReactAudioPlayer src={src} controls style={{ marginTop: "20px" }} />
        </div>
      )}
    </>
  );
};

export default AudioPlayer;