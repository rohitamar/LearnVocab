# LearnVocab

## Introduction
Web application that prompts you to write a definition to a word and then tells you whether written definition is close to the actual definition. 

## How it works
The immediate approach to do this would be to take the written definition, embed it with any SentenceTransformer, and see if the cosine similarity between this embedding and an embedding of the actual definition of the word is past some threshold. This definitely does work; but, in some of my tests, I noticed that even though my definition would mean the same as the true definition, the cosine similarity between the embeddings wouldn't match that. Hence, in order to boost the similarity prediction, I also add the option to add your own definitions. Then, we run a nearest neighbor query using MongoDB on all definition embeddings (of the same word and part of speech) and get the cosine similarity of this embedding. 
