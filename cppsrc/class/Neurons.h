#pragma once

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
union _ElementVar{
	char charContent;
	int intContent;
	long longContent;
	unsigned long unsignedlongContent;
};

typedef struct _Element{
    struct _Element *Prev; //前元素
    struct _Element *Next; //后元素
    struct _Element *SamePrev; //前同元素
    struct _Element *SameNext; //后同元素
    char *Content;
	union _ElementVar ElementVarContent;
}Element;

void buildElement(Element **Coordinate);//创建一个元素
void DestroyElement(Element **Coordinate);//销毁一个元素
Element *plusElement(Element **Coordinate);//追加元素
Element *MinusElement(Element **Coordinate);//减去元素
void ModificationElement(Element **Coordinate,char *Content);//修改元素内容

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//建立元素
void buildElement(Element **Coordinate)
{
    *Coordinate = (Element *)malloc(sizeof(Element));

	(*Coordinate)->Content = (char *)malloc(sizeof(char));
	*((*Coordinate)->Content) = '\0';

	(*Coordinate)->SameNext = NULL;
	(*Coordinate)->SamePrev = NULL;
    (*Coordinate)->Next = *Coordinate;
	(*Coordinate)->Prev = *Coordinate;
}

//销毁元素
void DestroyElement(Element **Coordinate)
{
    Element *temp = NULL;

	temp = (*Coordinate)->Next;
	(*Coordinate)->Next = NULL;
	while(temp != NULL)
	{
		*Coordinate = temp->Next;
		free(temp->Content);
        temp->Content = NULL;

		free(temp);
		temp = *Coordinate;
	}
}

//在指定元素后面追加
Element *plusElement(Element **Coordinate){
	Element *temp;
	Element *tempNext;
	Element *tempEnd;
	char *Content;

	temp = (*Coordinate);
	tempEnd = (*Coordinate)->Next;
	tempNext = NULL;
	Content = NULL;

	tempNext = (Element *)malloc(sizeof(Element));
	Content = (char *)malloc(sizeof(char));

	tempNext->Next = tempEnd;
	tempEnd->Prev = tempNext;
	tempNext->Prev = temp;
	temp->Next = tempNext;

	tempNext->Content = Content;
	//*((*Coordinate)->Content) = '\0';
	tempNext->SameNext = NULL;
	tempNext->SamePrev = NULL;
	(*Coordinate) = tempNext;
	tempNext->ElementVarContent.charContent = 0;
	return tempNext;
}

//销毁指定元素
Element *MinusElement(Element **Coordinate){
	Element *temp;
	Element *tempNext;
	Element *tempPrev;

	tempPrev = (*Coordinate)->Prev;
	tempNext = (*Coordinate)->Next;
	temp = (*Coordinate);

	free(temp->Content);
	free(temp);

	tempNext->Prev = tempPrev;
	tempPrev->Next = tempNext;
	(*Coordinate) = tempNext;
	return tempPrev;
}

//修改指定元素
void ModificationElement(Element **Coordinate,char *Content){
	
	free((*Coordinate)->Content);
	(*Coordinate)->Content = (char *)malloc(sizeof(char)*(strlen(Content)+1));//为字符串指针分配空间
	strcpy((*Coordinate)->Content,Content);

}
////////////////////////////////////////////////////////////////////////////////////////////