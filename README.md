# LearnVocab

Web/Mobile app that shows you a word, you type the definition, and the app tells you if it's right or not. Currently, using Gemini to do evaluation (see prompt.txt). I made an Expo App, but then thought that a website would be better -- so, now I have both in this repo.

What I eventually want to do:
- The prompt right now doesn't pass in the definition of the word. Might skew results for words that have multiple and different definitions. I think it might be better to add the definition for even better results.
- Gemini is fairly slow. Once there's many definitions for a particular word, we could try MiniLM embedding + weighted kNN (on the score) and see if the results match up. In general, it probably will -- once you've seen a word maybe 15-20 times, the definition you have for it is probably fairly similar to the previous 5 times you saw it. So, I think this should work and will speed up the evaluation procedure. 
