
import axios from 'axios';

// https://medium.com/@vipinnation/building-language-translation-in-a-react-js-app-with-google-translate-api-45e1236e2bad

//setting up translator, used code from the website above
export default class Translator {
      translateText = async (text, targetLanguage) => {
          const API_URL = 'https://translation.googleapis.com/language/translate/v2';
        const response = await axios.post(
            `${API_URL}?key=AIzaSyD106Ay0bch9-eZ5sXYm1kEFjCelf3N-Gg`,
            {
                q: text,
                target: targetLanguage,
            }
        )
        return response.data.data.translations[0].translatedText;
    }
}
