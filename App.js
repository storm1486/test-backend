import React, { useState, useEffect } from "react";
import {
  createQuestionForm,
  getInfo,
  authenticateCeramic,
  generateSeed,
  updateInfo,
} from "./ceramic.js"; // Import your functions

function App() {
  const [inputData, setInputData] = useState({
    type: "",
    question: "",
    user_answer: "",
  });
  const [ceramicInstance, setCeramicInstance] = useState(null);
  const [info, setInfo] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // Initialize Ceramic once on component mount
  useEffect(() => {
    const seed = generateSeed();
    authenticateCeramic(seed).then(setCeramicInstance);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (ceramicInstance) {
      try {
        await createQuestionForm(inputData);
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      console.error("Ceramic instance not initialized");
    }
  };
  const handleGetInfoClick = async () => {
    try {
      const fetchedInfo = await getInfo();
      setInfo(fetchedInfo); // Update state with the fetched information
    } catch (error) {
      console.error("Failed to fetch info:", error);
    }
  };

  const handleEditClick = (id) => {
    // Find the item with the matching ID
    const itemToEdit = info.data.questionFormIndex.edges.find(
      (edge) => edge.node.id === id
    );
    if (itemToEdit) {
      setInputData({
        type: itemToEdit.node.type,
        question: itemToEdit.node.question,
        user_answer: itemToEdit.node.user_answer,
      });
      setSelectedId(id); // Set the selected ID
    }
    console.log("inputdata:", inputData);
    console.log("id:", selectedId);
  };

  const handleUpdateInfoClick = async () => {
    if (ceramicInstance && selectedId) {
      try {
        // Assuming updateInfo function takes inputData and ceramicInstance as arguments
        await updateInfo(selectedId, inputData, ceramicInstance);
        console.log("Info updated successfully");
        console.log("updatedSelectedId:", selectedId);
        console.log("updatedInputData:", inputData);
        handleGetInfoClick();
      } catch (error) {
        console.error("Failed to update info:", error);
      }
    } else {
      console.error("Ceramic instance not initialized");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          name="type"
          value={inputData.type}
          onChange={handleInputChange}
          placeholder="Type"
        />
        <input
          name="question"
          value={inputData.question}
          onChange={handleInputChange}
          placeholder="Question"
        />
        <input
          name="user_answer"
          value={inputData.user_answer}
          onChange={handleInputChange}
          placeholder="User Answer"
        />
        <button type="submit">Submit</button>
        <button type="button" onClick={handleUpdateInfoClick}>
          Update Info
        </button>
      </form>
      <button onClick={handleGetInfoClick}>Get Info</button>

      {info &&
        info.data &&
        info.data.questionFormIndex.edges &&
        info.data.questionFormIndex.edges.length > 0 && (
          <div>
            {info.data.questionFormIndex.edges.map((edge, index) => (
              <div key={index}>
                <p>Input {index + 1}</p>
                <p>ID: {edge.node.id}</p>
                <p>Type: {edge.node.type}</p>
                <p>Question: {edge.node.question}</p>
                <p>User Answer: {edge.node.user_answer}</p>
                <button onClick={() => handleEditClick(edge.node.id)}>
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

export default App;
