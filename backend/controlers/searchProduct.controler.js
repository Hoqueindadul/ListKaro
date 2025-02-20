export const searchProduct = async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ message: "Please provide at least one search term." });
      }
  
      // Convert query string into an array (split by comma, trim spaces)
      const searchTerms = query.split(",").map((term) => term.trim().toLowerCase());
  
      let allResults = [];
  
      // Fetch results for each search term separately
      for (const term of searchTerms) {
        const apiUrl = `https://dummyjson.com/products/search?q=${encodeURIComponent(term)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
  
        // Merge results, avoiding duplicates
        allResults = [...allResults, ...data.products];
      }
  
      res.json(allResults);
    } catch (error) {
      res.status(500).json({ message: "Error fetching data", error: error.message });
    }
  };
  